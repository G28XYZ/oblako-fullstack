from django.core.files import File
from rest_framework import serializers

from users.models import User
from .models import FileModel, file_system

import string
import random

def get_random_string(l):
    letters = string.ascii_lowercase
    random_string = ''.join(random.choice(letters) for i in range(l))
    
    return random_string

def generate_download_id(l):
    return get_random_string(l)

def get_ext(file_name):
    return file_name.split('.')[-1]

def generate_storage_file_name(file_name):
    ext = f".{get_ext(file_name)}"
    result = file_system.get_alternative_name('storage', ext)
    return result


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

    file = serializers.FileField(allow_empty_file=True, required=False)

    class Meta:
        model = FileModel
        fields = ['file', 'comment']

    def create(self, **kwargs):

        file = File(self.validated_data['file'])

        origin_name = file.name

        file.name = generate_storage_file_name(file.name)

        user = User.objects.filter(id=kwargs['user_id']).first()

        data = {
            'owner': user,
            'name': file.name,
            'origin_name': origin_name,
            'size': file.size,
            'comment': self.validated_data['comment'],
            'file': file,
        }
        
        try:
            file_model = FileModel.objects.create(**data)

            return file_model

        except Exception as e:
            error = {
                'message': ', '.join(e.args) if len(e.args) > 0 else 'Unknown Error'
            }
            
            raise serializers.ValidationError(error)


    def patch(self, **kwargs):

        validated_data = patch_validator(self.initial_data)

        if kwargs['user'].is_staff:
            file = FileModel.objects.filter(id=validated_data['id']).first()
        else:
            file = FileModel.objects.filter(user_id=kwargs['user'].id).filter(id=validated_data['id']).first()

        if file:
            file.origin_name = validated_data['origin_name']
            file.comment = validated_data['comment']

            return file.save()