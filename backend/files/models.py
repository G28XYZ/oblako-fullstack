from django.db import models
from django.core.files.storage import FileSystemStorage
from django.contrib.auth import get_user_model

User = get_user_model()

file_system = FileSystemStorage(location='storage')

class FileModel(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    origin_name = models.CharField(max_length=50)
    size = models.IntegerField(null=True)
    created_at = models.DateField(auto_now_add=True, null=True)
    downloaded_at = models.DateField(null=True)
    comment = models.TextField(max_length=100, null=True, blank=True)
    file = models.FileField(storage=file_system, blank=True)