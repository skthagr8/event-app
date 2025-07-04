from django.db import models

# Create your models here.
from django.db import models
from users.models import User
from equipment.models import Equipment

class Booking(models.Model):
    STATUS_CHOICES = [
    ('pending_approval', 'Pending Approval'),
    ('confirmed', 'Confirmed'),
    ('rejected', 'Rejected'),
    ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
   # is_rental = models.BooleanField(default=True) but make sure to assert that the equipment 
   # is not available for sale before booking and is available (quantity > 0)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    start_date = models.DateTimeField()
    payment_complete = models.BooleanField(default=False)
    end_date = models.DateTimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    tracking_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.pk} by {self.user.name}"

class Purchases(models.Model):
    STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('rejected', 'Rejected'),
    ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_approval')
   # is_rental = models.BooleanField(default=False) but make sure to assert that the equipment
   # is available for sale before booking and is available (quantity > 0)
    tracking_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Purchase #{self.pk} by {self.user.name}"


