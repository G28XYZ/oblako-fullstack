# path('api/signin/', login_view),
# path('api/signup/', RegistrUserView.as_view()),
# path('api/logout/', logout_view),
# path('api/auth/get_csrf/', get_csrf_token),
# path('api/me/', me_view),
# path('api/users/delete/<int:user_id>/', delete_user),
# path('api/files/', FileView.as_view()),
# path('api/detail_users_list/', get_detail_user_list),
# path('api/link/', get_link),
# path('api/link/<str:link>/', get_file),

from django.urls import path

from .views import FileView

# /files/
urlpatterns = [
    path('', FileView.as_view()),
]