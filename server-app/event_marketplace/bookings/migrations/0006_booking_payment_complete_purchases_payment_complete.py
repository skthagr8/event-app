# Generated by Django 5.0.4 on 2025-07-01 08:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0005_booking_end_date_booking_equipment_booking_quantity_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='payment_complete',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='purchases',
            name='payment_complete',
            field=models.BooleanField(default=False),
        ),
    ]
