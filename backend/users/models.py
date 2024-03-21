from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser, PermissionsMixin

class UserManager(BaseUserManager):
    def _create_user(self, email, username, password, **extra_fields):
        if not email:
            raise ValueError('No email specified')

        if not username:
            raise ValueError('No username specified')

        user = self.model(
            email = self.normalize_email(email),
            username = username,
            **extra_fields,
        )

        user.set_password(password)

        user.save(using=self._db)

        return user
    
    def create_user(self, email, username, password):
        return self._create_user(email, username, password, role='user')

    def create_superuser(self, email, username, password):
        return self._create_user(email, username, password, role='admin')

class User(AbstractUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(db_index=True, max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    role = models.CharField(max_length=5, default='admin')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email