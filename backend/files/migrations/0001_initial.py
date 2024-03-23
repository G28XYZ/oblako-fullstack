# Generated by Django 5.0.3 on 2024-03-23 07:27

import django.core.files.storage
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('origin_name', models.CharField(blank=True, max_length=100, null=True)),
                ('custom_name', models.CharField(blank=True, max_length=100, null=True)),
                ('size', models.IntegerField(null=True)),
                ('created_at', models.DateField(auto_now_add=True, null=True)),
                ('downloaded_at', models.DateField(null=True)),
                ('comment', models.TextField(blank=True, max_length=100, null=True)),
                ('file', models.FileField(blank=True, storage=django.core.files.storage.FileSystemStorage(location='file_storage'), upload_to='')),
                ('public_link', models.CharField(blank=True, max_length=50, null=True, unique=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
