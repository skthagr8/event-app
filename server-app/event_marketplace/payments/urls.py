# payments/urls.py

from django.urls import path
from payments.views import HandleDarajaPayment,verify_payment
from payments.views import user_booking_payments, user_purchase_payments, user_bookings, user_purchases
urlpatterns = [
    path('daraja/', HandleDarajaPayment.as_view(), name='handle_daraja_payment'),
  #  path('callback/', daraja_callback),
    path('status/<str:tracking_id>/', verify_payment),
    path('user-booking-payments/', user_booking_payments, name='user_booking_payments'),
    path('user-purchase-payments/', user_purchase_payments, name='user_purchase_payments'),
    path('user-bookings/', user_bookings, name='user_bookings'),
    path('user-purchases/', user_purchases, name='user_purchases')
]
