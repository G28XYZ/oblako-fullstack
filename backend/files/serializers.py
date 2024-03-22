from django.core.files import File as FileCore
from rest_framework import serializers

from utils.constants import generate_storage_file_name
from users.models import User
from .models import File

def patch_validator(data):

    if 'id' not in data:
        raise serializers.ValidationError({
            'message': 'id parameter is lost',
        })

    if 'origin_name' not in data:
        raise serializers.ValidationError({
            'message': 'native_file_name parameter is lost',
        })

    if 'comment' not in data:
        raise serializers.ValidationError({
            'message': 'comment parameter is lost',
        })
    
    return data

class FileSerializer(serializers.ModelSerializer):

    file = serializers.FileField(write_only=True, allow_empty_file=True, required=False)
    comment = serializers.CharField(allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = File
        fields = ['id', 'owner', 'name', 'origin_name', 'custom_name', 'size', 'comment', 'file']
        extra_kwargs = { "id": {"read_only": True}, "owner": {"read_only": True} }
        

    def create(self, **kwargs):

        file = FileCore(self.validated_data['file'])
        
        origin_name = file.name
        storage_name = generate_storage_file_name(file.name)
        file.name = storage_name
        
        user = User.objects.filter(id=kwargs['user_id']).first()
        comment = ''
        if 'comment' in file:
            comment = self.validated_data['comment']
        data = {
            'owner': user,
            'name': storage_name,
            'origin_name': origin_name,
            'custom_name': self.validated_data['custom_name'] or origin_name,
            'size': file.size,
            'comment': comment,
            'file': file,
        }
        
        try:
            file_model = File.objects.create(**data)

            return file_model

        except Exception as e:
            error = {
                'message': ', '.join(e.args) if len(e.args) > 0 else 'Unknown Error'
            }
            
            raise serializers.ValidationError(error)


    def patch(self, **kwargs):

        validated_data = patch_validator(self.initial_data)

        if kwargs['user'].is_staff:
            file = File.objects.filter(id=validated_data['id']).first()
        else:
            file = File.objects.filter(user_id=kwargs['user'].id).filter(id=validated_data['id']).first()

        if file:
            file.origin_name = validated_data['origin_name']
            file.comment = validated_data['comment']

            return file.save()