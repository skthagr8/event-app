from rest_framework import routers
from users.views import UserViewSet
from equipment.views import CategoryViewSet, EquipmentViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register

urlpatterns = router.urls + [
    # Add any additional URLs here
    path('payments/', include('payments.urls'))]
