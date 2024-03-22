from datetime import timedelta
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate, login, logout, get_user
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.conf import settings

from users.models import User
from users.serializers import UserSerializer
from .serializers import RegisterSerializer
from utils.constants import create_response_data

import datetime

def set_cookie(response, key, value, days_expire=7):
    if days_expire is None:
        max_age = 365 * 24 * 60 * 60  # one year
    else:
        max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(
        datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age),
        "%a, %d-%b-%Y %H:%M:%S GMT",
    )
    response.set_cookie(
        key,
        value,
        max_age=max_age,
        expires=expires,
        domain=settings.SESSION_COOKIE_DOMAIN,
        secure=settings.SESSION_COOKIE_SECURE or None,
    )

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            refresh.payload.update({
                'user_id': user.id,
                'email': user.email
            })
            
            login(request, user)
            
            response = Response(
                create_response_data({ 'user': serializer.data, 'access_token': str(refresh.access_token)}),
                status=status.HTTP_201_CREATED
            )

            response.set_cookie('refresh_token', str(refresh))

            return response
        data = []
        for error in serializer.errors:
            data.append({ "message": '\n'.join(serializer.errors[error]) })

        return Response(
            create_response_data(data, type='error'),
            status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION
        )

        # serializer = self.get_serializer(data = request.data)

        # for user in User.objects.all():
        #     if not user:
        #         break
        #     else:
        #         try:
        #             Token.objects.get(user_id=user.id)
        #         except Token.DoesNotExist:
        #             Token.objects.create(user=user)

        # if serializer.is_valid():
        #     user = serializer.save()
        #     token = Token.objects.create(user=user)
        #     print(serializer.data, token.key)
            
        #     return Response(
        #         create_response_data(data={'user': serializer.data, 'access_token':token.key}),
        #         status=status.HTTP_201_CREATED
        #     )
        
        # data = []
        # for error in serializer.errors:
        #     data.append({ "message": '\n'.join(serializer.errors[error]) })

        # return Response(
        #     create_response_data(data, type='error'),
        #     status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION
        # )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email', None)
        password = data.get('password', None)

        if email is None or password is None:
            return Response(
                create_response_data(type='error', data={'error': 'Нужен и email, и пароль'}),
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                create_response_data([{"message": 'Некорректно введены email или пароль'}]),
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)

        refresh = RefreshToken.for_user(user)

        refresh.payload.update({
            'user_id': user.id,
            'email': user.email
        })
        
        userData = UserSerializer(user).data
        
        response = Response(
            create_response_data({ 'user': userData, 'access_token': str(refresh.access_token) }),
             status=status.HTTP_200_OK
        )

        response.set_cookie('refresh_token', str(refresh))
        

        return response


# @require_POST
# def login_view(request):
#     data = json.loads(request.body)
#     email = data.get('email')
#     password = data.get('password')

#     if email is None or password is None:
#         return Response(create_response_data(type='error', ), status=400)

#     user = authenticate(email=email, password=password)

#     if user is not None:
#         login(request, user)

#         return Response({
#             "message": "success",
#         })
    
#     return JsonResponse(
#         {
#         "message": "invalid credentials"
#         }, status=400
#     )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            token = request.COOKIES.get('refresh_token')
            refresh = RefreshToken(token)
            refresh.blacklist()
            logout(request)
            response = Response(create_response_data({'message': 'Выход успешен'}), status=status.HTTP_200_OK);
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            response = Response(
                create_response_data(
                    type='error',
                    data=[{'message': 'Что-то пошло не так повторите попытку'}]
                ),
                status=status.HTTP_400_BAD_REQUEST
            )
            if str(e) == 'Token is blacklisted':
                response.delete_cookie('refresh_token')
                response.data = create_response_data(
                    type='error',
                    data=[{'message': 'Токен в черном списке'}]
                )
            return response
            
        # try:
        # except:
        #     return Response(
        #         create_response_data(
        #             type='error',
        #             data=[{'message': 'Что-то пошло не так повторите попытку'}]
        #         ),
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        # try:
        #     token = request.headers.get('Authorization').split(' ')[1]
        #     refresh = RefreshToken(token)
        #     print(refresh)
        #     refresh.access_token.set_exp(lifetime=timedelta(days=0))
        #     logout(request)
        #     return Response(create_response_data({'message': 'Выход успешен'}), status=status.HTTP_200_OK)
        # except:
        #     return Response(
        #         create_response_data(
        #             type='error',
        #             data=[{'message': 'Токен должен быть в заголовке'}, {'message': 'Что-то пошло не так повторите попытку'}]
        #         ),
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

# @require_POST
# def on_logout(request):
#     logout(request)
#     return Response(create_response_data({ 'message': 'Успешно' }))