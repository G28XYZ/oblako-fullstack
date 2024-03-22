from rest_framework import serializers

from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        extra_kwargs = { "id": {"read_only": True} }
        lookup_field = "user_id"