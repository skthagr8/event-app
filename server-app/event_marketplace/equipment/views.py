from django.shortcuts import render
from django.db import transaction
from rest_framework.response import Response
from rest_framework.decorators import action

# Create your views here.
from rest_framework import viewsets
from .models import Category, Equipment
from .serializers import CategorySerializer, EquipmentSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, AllowAny

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Equipment.objects.all()
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category) or queryset.filter(category__id=category)
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request   # ✅ key fix
        return context
 

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data

        quantity = int(data.get('quantity') or 0)
        name = data.get('name')
   
        # Check if the equipment already exists
        if Equipment.objects.filter(name=name).exists():
            return Response({"error": "Equipment with this name already exists."}, status=400)
        
        if quantity <= 0:
            return Response({"error": "Quantity must be greater than zero."}, status=400)
        
        equipment = Equipment.objects.create(
            vendor=request.user,
            category_id=data.get('category'),
            image_url=data.get('image_url'),
            name=data.get('name'),
            image=data.get('image'),
            description=data.get('description'),
            price_per_day=data.get('price_per_day'),
            buying_price=data.get('buying_price'),
            quantity=quantity,
            is_available=True,
            is_premium=data.get('is_premium', False),
            for_sale=data.get('for_sale', False),
            condition=data.get('condition', 'brand new')
        )
        serializer = self.get_serializer(equipment)
        return Response(serializer.data, status=201)
    
    @action(detail=False, methods=['get'], url_path='by-category/(?P<category_id>[^/.]+)')
    def by_category(self, request, category_id=None):
        equipments = Equipment.objects.filter(category_id=category_id)
        serializer = self.get_serializer(equipments, many=True)
        return Response(serializer.data)
     
    @action(detail=False, methods=['get'], url_path='my-listings')
    def my_listings(self, request):
        equipments = Equipment.objects.filter(vendor=request.user).order_by('-created_at', 'buying_price')
        serializer = self.get_serializer(equipments, many=True)
        return Response(serializer.data)
    
    
    # views.py
from rest_framework import generics
from .models import Equipment
from .serializers import EquipmentSerializer

class EquipmentListView(generics.ListAPIView):
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        queryset = Equipment.objects.all()
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        return queryset
