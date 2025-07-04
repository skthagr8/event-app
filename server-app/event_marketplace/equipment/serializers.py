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

    class Meta:
        model = Equipment
        fields = '__all__'
        
    category = serializers.SlugRelatedField(
        slug_field='name',
        read_only=True
    )

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image_url

