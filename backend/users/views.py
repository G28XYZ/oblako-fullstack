from django.http import JsonResponse
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token

from .models import User
from .serializers import RegisterUserSerializer
from utils.constants import create_response_data

class RegisterUserView(CreateAPIView):
    queryset = User.objects.all()

    serializer_class = RegisterUserSerializer

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data = request.data)

        for user in User.objects.all():
            if not user:
                break
            else:
                try:
                    Token.objects.get(user_id=user.id)
                except Token.DoesNotExist:
                    Token.objects.create(user=user)

        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.create(user=user)
            print(serializer.data, token.key)
            
            return Response(
                create_response_data(data={'user': serializer.data, 'access_token':token.key}),
                status=status.HTTP_201_CREATED
            )
        
        data = []
        for error in serializer.errors:
            data.append({ "message": '\n'.join(serializer.errors[error]) })

        return Response(create_response_data(data, type='error'), status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)


@api_view(['GET'])
# @permission_classes([IsAdminUser])
def get_users(request):
    result = User.objects.annotate(size=Sum('filemodel__size'), count=Count('filemodel__id')).values(
        'id', 'username', 'email', 'count', 'size')

    if result:
        return Response(create_response_data(result), status=status.HTTP_200_OK)

    return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    user = User.objects.get(id=user_id)

    if user:
        user.delete()

        return JsonResponse({
            "message": "success",
        })
    
    return JsonResponse({
        "message": 'User not found',
    }, status=404)