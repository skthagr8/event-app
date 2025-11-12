from rest_framework import serializers
from .models import Category, Equipment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    is_premium = serializers.BooleanField()
    for_sale = serializers.BooleanField()

    category = serializers.SlugRelatedField(
        slug_field='name',
        read_only=True
    )

    class Meta:
        model = Equipment
        fields = '__all__'

    def get_image_url(self, obj):
        if obj.image:
            return f"media/{obj.image.name.replace('\\', '/')}"
        return None



