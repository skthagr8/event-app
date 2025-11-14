"""
URL configuration for event_marketplace project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import RegisterView, LoginView
from payments import views as payment_views
from bookings import views as booking_views

# Add these imports
from django.http import HttpResponse
from django.contrib.auth import get_user_model

# Add this function at the top of urls.py
def create_admin(request):
    User = get_user_model()
    
    if User.objects.filter(is_superuser=True).exists():
        return HttpResponse("Admin already exists.")
    
    User.objects.create_superuser(
        username="admin",
        email="joelembiid@gmail.com",
        password="JoelEmbiid@2025"
    )
    return HttpResponse("Superuser created.")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('create-admin/', create_admin),
    path('api/', include('event_marketplace.api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/payments/bookings/', payment_views.user_booking_payments),
    path('api/payments/purchases/', payment_views.user_purchase_payments),
    path('api/bookings/user/', booking_views.user_bookings),
    path('api/purchases/user/', booking_views.user_purchases),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


