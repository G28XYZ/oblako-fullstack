from django.http import JsonResponse
from django.db.models import Sum, Count
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import api_view

from .models import User
from utils.constants import create_response_data

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    result = User.objects.annotate(size=Sum('filemodel__size'), count=Count('filemodel__id')).values(
        'id', 'username', 'email', 'count', 'size')

    if result:
        return Response(create_response_data(result), status=status.HTTP_200_OK)

    return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
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