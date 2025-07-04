from django.contrib import admin
from equipment.models import Equipment,Category
from users.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from bookings.models import Booking
from payments.models import PaymentIntent, BookingPayment, PurchasesPayment, Purchases


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'vendor':
            from django.contrib.auth import get_user_model
            User = get_user_model()
            kwargs['queryset'] = User.objects.filter(role='vendor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    @admin.action(description='Assign to random Vendor')
    def assign_to_random_vendor(self, request, queryset):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        vendors = User.objects.filter(role__iexact='vendor')
        if not vendors.exists():
            self.message_user(request, "No vendor users found.", level='error')
            return

        for equipment in queryset:
            equipment.vendor = vendors.order_by('?').first()
            equipment.save()

        self.message_user(request, f"{queryset.count()} equipment items assigned.")

    @admin.action(description='Set Vendor to Samuel Kahiga (ID 55)')
    def set_vendor_to_samuel(self, request, queryset):
        try:
            samuel = User.objects.get(id=55)
        except User.DoesNotExist:
            self.message_user(request, "Samuel Kahiga (ID 55) not found.", level='error')
            return

        updated = queryset.update(vendor=samuel)
        self.message_user(request, f"{updated} equipment items now belong to Samuel Kahiga.")
    @admin.action(description='Increase Quantity by 10')
    def add_quantity_10(self, request, queryset):
        for equipment in queryset:
            equipment.quantity += 10
            equipment.save()
        self.message_user(request, f"Quantity increased by 10 for {queryset.count()} equipment items.")
    
    @admin.action(description='Mark Equipment as Available')
    def mark_as_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f"{updated} equipment items marked as available.")

    actions = [
        'assign_to_random_vendor', 'set_vendor_to_samuel', 'add_quantity_10'
        , 'mark_as_available']

admin.site.register(User)
admin.site.register(Category)
admin.site.register(Booking)
admin.site.register(PaymentIntent)
admin.site.register(BookingPayment)
admin.site.register(PurchasesPayment)
admin.site.register(Purchases)



admin.site.site_header = "Event Marketplace Admin"
admin.site.site_title = "Event Marketplace Admin Portal"
admin.site.index_title = "Welcome to the Event Marketplace Admin Portal"

# Register your models here.
