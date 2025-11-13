from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
import re


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name', 'phone_number', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        email = value.strip().lower()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise serializers.ValidationError("Enter a valid email address.")
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one letter and one number.")
        return value

    def validate_phone_number(self, value):
        cleaned = value.strip().replace(" ", "")
        if not re.match(r"^\d{10,15}$", cleaned):
            raise serializers.ValidationError("Enter a valid phone number with 10–15 digits.")
        return cleaned

    def validate_role(self, value):
        valid_roles = ['renter', 'vendor']
        if value.lower() not in valid_roles:
            raise serializers.ValidationError("Role must be either 'Renter' or 'Vendor'.")
        return value.capitalize()

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone_number', 'password', 'role']

    def validate_email(self, value):
        email = value.strip().lower()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise serializers.ValidationError("Enter a valid email address.")
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one letter and one number.")
        return value

    def validate_phone_number(self, value):
        cleaned = value.strip().replace(" ", "")
        if not re.match(r"^\d{10,15}$", cleaned):
            raise serializers.ValidationError("Enter a valid phone number with 10–15 digits.")
        return cleaned

    def validate_role(self, value):
        valid_roles = ['renter', 'vendor']
        if value.lower() not in valid_roles:
            raise serializers.ValidationError("Role must be either 'Renter' or 'Vendor'.")
        return value.capitalize()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data['role'],
        )
        return user

    def to_representation(self, instance):
        """Return JWT tokens upon registration."""
        data = super().to_representation(instance)
        refresh = RefreshToken.for_user(instance)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        return data
