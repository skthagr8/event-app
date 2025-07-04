from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, EquipmentViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'equipment-by-category', EquipmentViewSet, basename='equipment-by-category')
router.register(r'my-listings', EquipmentViewSet, basename='my-listings')

urlpatterns = router.urls