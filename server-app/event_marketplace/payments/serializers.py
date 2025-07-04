from rest_framework import serializers
from payments.models import BookingPayment, PurchasesPayment


# payments/serializers.py

from rest_framework import serializers
from payments.models import BookingPayment, PurchasesPayment

class BookingPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingPayment
        fields = '__all__'

class PurchasesPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchasesPayment
        fields = '__all__'
