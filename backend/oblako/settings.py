import config.settings as CONFIG

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = CONFIG.BASE_DIR

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-51fy7oh%q11hmb&#)xax#6k3oir6$0-ph1ld9zdq!(-3ppun$0'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = CONFIG.DEBUG

# LOGGING = CONFIG.LOGGING

ALLOWED_HOSTS = CONFIG.ALLOWED_HOSTS

FILE_SYSTEM = CONFIG.FILE_SYSTEM

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    
    'config',
    'authorize',
    'users',
    'files',
    'utils'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware"
]

ROOT_URLCONF = 'oblako.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'oblako.wsgi.application'

REST_FRAMEWORK = CONFIG.REST_FRAMEWORK

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = CONFIG.DATABASES


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = CONFIG.AUTH_PASSWORD_VALIDATORS

AUTH_USER_MODEL = CONFIG.AUTH_USER_MODEL

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_METHODS = CONFIG.CORS_ALLOW_METHODS

SECRET_KEY = CONFIG.SECRET_KEY

SIMPLE_JWT = CONFIG.SIMPLE_JWT