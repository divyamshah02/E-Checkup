from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user_id', 'name', 'email', 'contact_number', 'role', 'device_id', 'is_active']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = instance.get_role_display()
        return data
