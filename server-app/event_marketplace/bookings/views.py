from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Booking
from equipment.models import Equipment
from .serializers import BookingSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction


from rest_framework.permissions import BasePermission, IsAuthenticated

class IsVendorOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'Vendor' and all(
            item.equipment.vendor == request.user for item in obj.bookingitem_set.all()
        )


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        INVALID_STATUSES = {
            'rejected': "Booking has already been rejected.",
            'confirmed': "Booking has already been confirmed.",
            'cancelled': "Booking has already been cancelled.",
        }
        booking = self.get_object()
        
        if booking.status != 'pending_approval':
            message = INVALID_STATUSES.get(
            booking.status, 
            "Booking is not in a state that allows updates."
            )
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        INVALID_STATUSES = {
            'rejected': "Booking has already been rejected.",
            'confirmed': "Booking has already been confirmed.",
            'cancelled': "Booking has already been cancelled.",
        }
        booking = self.get_object()
        
        if booking.status != 'pending_approval':
            message = INVALID_STATUSES.get(
            booking.status, 
            "Booking is not in a state that allows deletion."
            )
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
    
 

    @action(detail=False, methods=['get'], url_path='my-bookings')
    def my_bookings(self, request):
       # Return bookings where the current user is the one who made the booking
       bookings = Booking.objects.filter(user=request.user)
       serializer = self.get_serializer(bookings, many=True)
       return Response(serializer.data, status=status.HTTP_200_OK)
    



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import BookingSerializer
from payments.serializers import PurchasesPaymentSerializer, BookingPaymentSerializer
from payments.models import Purchases
from bookings.models import Booking
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    bookings = Booking.objects.filter(user=request.user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_purchases(request):
    purchases = Purchases.objects.filter(user=request.user)
    from payments.serializers import PurchasesPaymentSerializer # Ensure serializer exists
    serializer = PurchasesPaymentSerializer(purchases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)






             
            
        
