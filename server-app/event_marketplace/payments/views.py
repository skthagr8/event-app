from rest_framework.views import APIView
from django.conf import settings
from payments.models import BookingPayment, PurchasesPayment, PaymentIntent
from bookings.models import Booking, Purchases
from equipment.models import Equipment
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
import base64
import requests
from payments.utils.daraja import DarajaAPI
import uuid

daraja = DarajaAPI()

class HandleDarajaPayment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        required_fields = ['user_id', 'first_name', 'last_name', 'email', 'equipment_id', 'total_price', 'phone', 'payment_type']
        if not all(data.get(field) for field in required_fields):
            return Response({'error': 'Missing fields'}, status=400)

        user_id = data['user_id']
        equipment_id = data['equipment_id']
        total_price = data['total_price']
        phone = data['phone']
        payment_type = data['payment_type']

        try:
            equipment = Equipment.objects.get(id=equipment_id)
        except Equipment.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=404)

        if not equipment.for_sale and not equipment.is_available:
            return Response({'error': 'Equipment is not available for sale'}, status=400)
        if equipment.quantity <= 0:
            return Response({'error': 'Out of stock'}, status=400)

        # Check duplicate transactions
        if payment_type == 'booking' and Booking.objects.filter(equipment=equipment, user_id=user_id).exists():
            return Response({'error': 'Already booked'}, status=400)
        elif payment_type == 'purchase' and Purchases.objects.filter(equipment=equipment, user_id=user_id).exists():
            return Response({'error': 'Already purchased'}, status=400)

        tracking_id = str(uuid.uuid4())

        try:
            response = daraja.initiate_stk_push(
                amount=total_price,
                phone_number=phone,
                account_reference=tracking_id,
                transaction_desc=f"{payment_type.capitalize()} for equipment {equipment_id}"
            )

            if response.get("ResponseCode") != "0":
                return Response({"error": response.get("errorMessage", "Daraja STK push failed")}, status=400)
            
            checkout_request_id = response.get("CheckoutRequestID")
            if not checkout_request_id:
                return Response({'error': 'CheckoutRequestID not found in response'}, status=400)
            
            # Create payment intent
            PaymentIntent.objects.create(
            user_id=user_id,
            equipment_id=equipment_id,
            amount=total_price,
            payment_type=payment_type,
            checkout_id=checkout_request_id,
            tracking_id=tracking_id,
            start_date=data.get('start_date'),  # Optional, can be None
            end_date=data.get('end_date')  # Optional, can be None
            )
            # Verify payment intent was created successfully
            intent = PaymentIntent.objects.filter(tracking_id=tracking_id).first()
            if not intent:
                return Response({'error': 'Failed to create payment intent'}, status=500)

            return Response({
                "message": "STK push initiated successfully",
                "MerchantRequestID": response.get("MerchantRequestID"),
                "CheckoutRequestID": response.get("CheckoutRequestID"),
                "tracking_id": tracking_id
            })
        
        

        except Exception as e:
            return Response({'error': str(e)}, status=500)
    

'''


@api_view(['POST'])
def daraja_callback(request):
    try:
        body = json.loads(request.body.decode('utf-8'))
        print("DARAJA CALLBACK:", body)

        stk_callback = body.get("Body", {}).get("stkCallback", {})
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])

        checkout_request_id = stk_callback.get("CheckoutRequestID")

        # Extract amount and phone from metadata
        amount = phone = mpesa_receipt = None
        for item in metadata_items:
            if item['Name'] == 'Amount':
                amount = item['Value']
            elif item['Name'] == 'MpesaReceiptNumber':
                mpesa_receipt = item['Value']
            elif item['Name'] == 'PhoneNumber':
                phone = item['Value']

        if result_code != 0:
            return Response({"message": "Payment failed or cancelled"}, status=200)

        # Find intent
        intent = PaymentIntent.objects.filter(tracking_id=stk_callback.get("MerchantRequestID")).first()
        if not intent:
            return Response({"error": "Payment intent not found"}, status=404)

        # Fulfill order
        user = intent.user
        equipment = intent.equipment

        if intent.payment_type == 'booking':
            # Extract start_date and end_date from intent or set to None/default if not present
            start_date = getattr(intent, 'booking_start_date', None)
            end_date = getattr(intent, 'booking_end_date', None)
            booking = Booking.objects.create(
                user=user,
                equipment=equipment,
                quantity = 1,
                total_price=amount,
                start_date=start_date,
                end_date=end_date,
                status='confirmed',
                payment_complete=True
            )
            BookingPayment.objects.create(
                booking=booking,
                amount=amount,
                method='mpesa',
                status='success',
                tracking_id=intent.tracking_id,
                receipt=mpesa_receipt
            )
        elif intent.payment_type == 'purchase':
            purchase = Purchases.objects.create(
                user=user,
                equipment=equipment,
                total_price=amount,
                status='confirmed',
            
            )
            PurchasesPayment.objects.create(
                purchase=purchase,
                amount=amount,
                method='mpesa',
                status='success',
                tracking_id=intent.tracking_id,
                receipt=mpesa_receipt
            )

        intent.status = 'confirmed'
        intent.checkout_id = checkout_request_id
        intent.save()

        return Response({"message": "Payment processed successfully"}, status=200)

    except Exception as e:
        print("Callback error:", str(e))
        return Response({"error": "Failed to process payment"}, status=500)

'''




from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from payments.models import PaymentIntent, BookingPayment, PurchasesPayment
from bookings.models import Booking, Purchases
from payments.utils.daraja import DarajaAPI

@api_view(['GET'])
def verify_payment(request, tracking_id):
    try:
        intent = PaymentIntent.objects.filter(tracking_id=tracking_id).first()
        if not intent:
            return Response({'status': 'invalid tracking ID'}, status=404)
        if not intent.checkout_id:
            return Response({'status': 'missing checkout ID'}, status=400)

        daraja = DarajaAPI()
        result = daraja.stk_push_query(intent.checkout_id)
        print("STK Query Response:", result)

        result_code = result.get('ResultCode')
        if result_code == '0':
            # Check if payment already exists
            existing_payment = PurchasesPayment.objects.filter(tracking_id=intent.tracking_id).first()
            if existing_payment:
                print("Payment already processed:", existing_payment)
                return Response({'status': 'already processed'}, status=201)
            
            existing_booking_payment = BookingPayment.objects.filter(tracking_id=intent.tracking_id).first()
            if existing_booking_payment:
                print("Booking payment already processed:", existing_booking_payment)
                return Response({'status': 'already processed'}, status=201)
            print(intent.start_date)
            print(intent.end_date)
            # Handle purchase
            if intent.payment_type == 'purchase':
                purchase = Purchases.objects.create(
                    user=intent.user,
                    equipment=intent.equipment,
                    total_price=intent.amount,
                    status='confirmed',
                )
                PurchasesPayment.objects.create(
                    purchase=purchase,
                    amount=intent.amount,
                    method='mpesa',
                    status='success',
                    tracking_id=intent.tracking_id,
                    paid_at=datetime.now()
                )

            # Handle booking
            elif intent.payment_type == 'booking':
                booking = Booking.objects.create(
                    user=intent.user,
                    equipment=intent.equipment,
                    quantity=1,
                    total_price=intent.amount,
                    start_date=intent.start_date,
                    end_date=intent.end_date,
                    status='confirmed',
                    payment_complete=True
                )
                BookingPayment.objects.create(
                    booking=booking,
                    amount=intent.amount,
                    method='mpesa',
                    status='success',
                    tracking_id=intent.tracking_id,
                    paid_at=datetime.now()
                )

            intent.status = 'confirmed'
            intent.save()

            return Response({'status': 'success'}, status=200)

        elif result_code in ['1032', '1037']:
            return Response({'status': 'cancelled'}, status=200)
        else:
            return Response({'status': 'pending'}, status=202)

    except Exception as e:
        print("verify_payment error:", str(e))
        return Response({'error': str(e)}, status=500)




# payments/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from payments.models import BookingPayment, PurchasesPayment
from bookings.models import Booking, Purchases
from payments.serializers import BookingPaymentSerializer, PurchasesPaymentSerializer
from bookings.serializers import BookingSerializer, PurchasesSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_booking_payments(request):
    payments = BookingPayment.objects.filter(booking__user=request.user).order_by('-paid_at')
    return Response(BookingPaymentSerializer(payments, many=True).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_purchase_payments(request):
    payments = PurchasesPayment.objects.filter(purchase__user=request.user).order_by('-paid_at')
    return Response(PurchasesPaymentSerializer(payments, many=True).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-start_date')
    return Response(BookingSerializer(bookings, many=True).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_purchases(request):
    purchases = Purchases.objects.filter(user=request.user).order_by('-created_at')
    return Response(PurchasesSerializer(purchases, many=True).data, status=status.HTTP_200_OK)


