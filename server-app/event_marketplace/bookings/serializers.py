from rest_framework import serializers
from .models import Booking
from equipment.serializers import EquipmentSerializer
from users.serializers import UserSerializer
from .models import Purchases

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class PurchasesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchases
        fields = '__all__'

        
