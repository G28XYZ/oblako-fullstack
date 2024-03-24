from django.urls import path
from .views import front

urlpatterns = [
    path("", front, name="front"),
    path("signin", front, name="front"),
    path("signup", front, name="front"),
]
