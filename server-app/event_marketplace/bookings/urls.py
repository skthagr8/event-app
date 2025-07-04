
from rest_framework.routers import DefaultRouter

from bookings.views import BookingViewSet
router = DefaultRouter()

router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'booking-payments', BookingViewSet, basename='booking-payment')





