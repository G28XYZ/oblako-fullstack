from django.http import FileResponse
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from datetime import date

from .serializers import FileSerializer
from .models import File
from utils.constants import create_response_data
from oblako.settings import FILE_SYSTEM
from utils.mixins import StaffEditorPermissionMixin

class FileAPIView(StaffEditorPermissionMixin, generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    
    def get(self, request, *args, **kwargs):
        response = super().get(self, request, args, kwargs)
        if response:
            response.data = create_response_data(response.data)
            return response
    
    def post(self, request):
        serializer = FileSerializer(data=request.data)

        data = {}

        if serializer.is_valid():
            serializer.create(user_id=request.user.id, file=request.FILES['file'])

            data = self.get_queryset().values(
                'id',
                'owner',
                'size',
                'origin_name',
                'created_at',
                'downloaded_at',
                'comment'
            )
            
            return Response(data, status=status.HTTP_200_OK) 

        data = serializer.errors

        return Response(data)

class FileDeleteAPIView(StaffEditorPermissionMixin, generics.DestroyAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def delete(self, request, *args, **kwargs):
        file_ids = request.data
        pk = kwargs.get('pk', None)
        response = Response()
        if file_ids:
            files = self.queryset.filter(id__in=file_ids)
            for file in files:
                FILE_SYSTEM.delete(str(file))
            count, _ = files.delete()
            if count:
                response.data = create_response_data({ 'message': 'Выбранные файлы удалены' })
                response.status_code = status.HTTP_204_NO_CONTENT
            else:
                response.data = create_response_data({ 'message': 'Выбранные файлы не существуют' }, 'error')
                response.status_code = status.HTTP_404_NOT_FOUND
        elif pk:
            response = super().delete(self, request, args, kwargs)
            if response:
                response.data = create_response_data({ "message": "Файл удален" })
        else:
            response.data = create_response_data({ 'message': 'Переданы не корректные данные' }, 'error')
            response.status_code = status.HTTP_400_BAD_REQUEST

        return response

class FileView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user_id=None):

        if self.request.user.role == 'admin' and user_id:
            return File.objects.filter(owner=user_id).all()

        return File.objects.filter(owner=self.request.user.id).all()

    def get(self, request):
        user = request.user
        if user:
            files = self.get_queryset(user.id).values(
                'id',
                'owner__username',
                'size',
                'origin_name',
                'created_at',
                'downloaded_at',
                'comment'
            )
            return Response(create_response_data(files))
            
            
        file = self.get_queryset().filter(id = request.query_params['id']).first()

        if file:
            file.downloaded_at = date.today()
            file.save()
            return FileResponse(file.file, status.HTTP_200_OK, as_attachment=True)

        data = {
                'message': 'The file not found',
            }
        
        return Response(data, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        serializer = FileSerializer(data=request.data)

        data = {}

        if serializer.is_valid():
            serializer.create(user_id=request.user.id, file=request.FILES['file'])

            data = self.get_queryset().values(
                'id',
                'user__username',
                'size',
                'origin_name',
                'created_at',
                'downloaded_at',
                'comment'
            )
            
            return Response(data, status=status.HTTP_200_OK) 

        data = serializer.errors

        return Response(data)

    def patch(self, request):
        serializer = FileSerializer(data=request.data)

        data = {}

        if serializer.is_valid():
            user = request.user

            serializer.patch(
                owner=user,
            )

            if 'user_storage_id' in request.query_params and user.role == 'admin':
                data = self.get_queryset(
                    user_id=request.query_params['user_storage_id']
                ).values(
                    'id',
                    'user__username',
                    'size',
                    'origin_name',
                    'created_at',
                    'downloaded_at',
                    'comment',
                )
            else:
                data = self.get_queryset().values(
                    'id',
                    'user__username',
                    'size',
                    'origin_name',
                    'created_at',
                    'downloaded_at',
                    'comment'
                )

            return Response(data)

        data = serializer.errors
        
        return Response(data)

    def delete(self, request):
        if request.user.role == 'admin':
            deleted_file = File.objects.filter(
                id=int(request.query_params['id'])
            ).first()
        else:
            deleted_file = File.objects.filter(
                user_id=request.user.id
            ).all().filter(
                id=int(request.query_params['id'])
            ).first()

        if deleted_file:
            FILE_SYSTEM.delete(deleted_file.storage_name)

            deleted_file.delete()

            user = request.user

            if 'user_storage_id' in request.query_params and user.is_staff:
                data = self.get_queryset(
                    user_id=request.query_params['user_storage_id']
                ).values(
                    'id',
                    'user__username',
                    'size',
                    'origin_name',
                    'created_at',
                    'downloaded_at',
                    'comment',
                )
            else:
                data = self.get_queryset().values(
                    'id',
                    'user__username',
                    'size',
                    'origin_name',
                    'created_at',
                    'downloaded_at',
                    'comment',
                )
       
            return Response(data, status.HTTP_200_OK)

        data = {
            'message': 'The file not found',
        }
        
        return Response(data, status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_link(request):
    user_id = request.user.id
    file_id = request.query_params['file_id']

    if request.user.role == 'admin':
        file = File.objects.filter(id=file_id).first()
    else:
        file = File.objects.filter(user_id=user_id).filter(id=file_id).first()
    
    if file:
        data = {
            'link': file.id,
        }

        return Response(data, status=status.HTTP_200_OK)

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def get_file(request, file_id):
    file = File.objects.filter(id=file_id).first()

    if file:
        file.downloaded_at = date.today()
        file.save()
        
        return FileResponse(file.file, status.HTTP_200_OK, as_attachment=True, filename=file.origin_name)

    return Response(status=status.HTTP_404_NOT_FOUND)