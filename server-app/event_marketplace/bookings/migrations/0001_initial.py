# Generated by Django 5.0.4 on 2025-06-12 08:42

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('equipment', '0004_alter_equipment_image_url'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_rental', models.BooleanField(default=True)),
                ('status', models.CharField(choices=[('open', 'Open'), ('confirmed', 'Confirmed'), ('not paid', 'Not Paid')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='BookingItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField()),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bookings.booking')),
                ('equipment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.equipment')),
            ],
        ),
    ]
