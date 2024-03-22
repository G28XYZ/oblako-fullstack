from rest_framework import serializers

from .models import User
from utils.validators import min_length

class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        # TODO - добавить валидаторы на корректность введенных символов в пароле в соотв с требованиями
        validators=[lambda value: min_length(value, 6, 'пароля')]
    )
    class Meta:
        model = User
        fields = [
            "id", 
            "username",
            "role",
            "email",
            "password",
            "is_staff",
            # "first_name",
            # "last_name",
            # "is_active",
        ]
        extra_kwargs = {"id": {"read_only": True}, "password": {"write_only": True}, "is_staff": {"write_only": True}}

    def create(self, validated_data):
        email = validated_data['email']
        username = validated_data['username']
        password = validated_data['password']
        role = 'admin'
        is_staff = role == 'admin'
        # user.set_password(password)

        # user.save()
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            is_staff=is_staff
        )
        
        print(user)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'role']