import logging
logger = logging.getLogger( __name__)

from django.db.models import Sum, Count
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import api_view

from .models import User
from utils.constants import create_response_data
from utils.mixins import StaffEditorPermissionMixin
from .serializers import UserSerializer

# TODO -рефакторинг методов, убрать try

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_users(request):
    logger.info('API request: %s %s' % (request.method, request.path))
    result = User.objects.annotate(size=Sum('file__size'), count=Count('file__id')).values('id', 'username', 'email', 'count', 'size')

    if result:
        return Response(create_response_data(result), status=status.HTTP_200_OK)

    return Response(status=status.HTTP_404_NOT_FOUND)

class UserUpdateAPIView(StaffEditorPermissionMixin, generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # lookup_field = 'pk' # default
    
    def perform_update(self, serializer):
        logger.info('API request: %s %s' % (self.request.method, self.request.path))
        instance = self.get_object()
        serializer.save(is_superuser=instance.role == 'admin')

class UserDeleteAPIView(StaffEditorPermissionMixin, generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def delete(self, request, *args, **kwargs):
        logger.info('API request: %s %s' % (request.method, request.path))
        user_ids = request.data
        pk = kwargs.get('pk', None)
        response = Response()
        if user_ids:
            count, _ = self.queryset.filter(id__in=user_ids).delete()
            if count:
                response.data = create_response_data({ 'message': 'Выбранные пользователи удалены' })
                response.status_code = status.HTTP_204_NO_CONTENT
            else:
                response.data = create_response_data({ 'message': 'Выбранных пользователей не существует' }, 'error')
                response.status_code = status.HTTP_404_NOT_FOUND
        elif pk:
            response = super().delete(self, request, args, kwargs)
            if response:
                response.data = create_response_data({ "message": "Пользователь удален" })
        else:
            response.data = create_response_data({ 'message': 'Переданы не корректные данные' }, 'error')
            response.status_code = status.HTTP_400_BAD_REQUEST

        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    logger.info('API request: %s %s' % (request.method, request.path))
    try:
        user = User.objects.filter(
                id=request.user.id
            ).annotate(
                size=Sum('file__size'),
                count=Count('file__id'),
            ).values('id', 'username', 'email', 'count', 'size')
        
        
        return Response(create_response_data(user))
    except:
        pass
    return Response(
        create_response_data(type='error', data={"message": 'Пользователь не найден'}),
        status=status.HTTP_404_NOT_FOUND
    )