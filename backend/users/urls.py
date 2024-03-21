from django.urls import path

from .views import get_users, delete_user

# /users/
urlpatterns = [
    path('', get_users),
    path('delete/<int:user_id>/', delete_user)
]