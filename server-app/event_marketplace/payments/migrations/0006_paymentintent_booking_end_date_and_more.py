# Generated by Django 5.0.4 on 2025-07-01 19:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0005_paymentintent'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentintent',
            name='booking_end_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='paymentintent',
            name='booking_start_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='paymentintent',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('rejected', 'Rejected'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
    ]
