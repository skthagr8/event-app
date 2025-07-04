from django.db import models

# Create your models here.
from django.db import models
from users.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    vendor = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    image_url = models.URLField(max_length=255, blank=True, null=True)
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='equipment_images/', blank=True, null=True)
    description = models.TextField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    buying_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False)
    for_sale = models.BooleanField(default=False)
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Creation Date'
    )
    condition = models.CharField(max_length=50, choices=[
        ('brand new', 'Brand New'),
        ('used', 'Used'),
    ], default='brand new')
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name='Last Updated Date'
    )


    def __str__(self):
        return self.name
