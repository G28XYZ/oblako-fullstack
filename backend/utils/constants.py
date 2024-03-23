import string
import random

from oblako.settings import FILE_SYSTEM

error_messages = {
    "unique_user": lambda field: f'Пользователь с таким {field} уже существует',
}


def create_response_data(data, type='success'):
    if type == 'error':
        return { "errors": data, "success": False }
    if 'password' in data:
        del data['password']
    return { "data": data, "success": True }


def get_random_string(l):
    letters = string.ascii_lowercase
    random_string = ''.join(random.choice(letters) for _ in range(l))
    return random_string


def generate_random_link(l):
    return get_random_string(l)


def get_ext(file_name):
    return file_name.split('.')[-1]


def generate_storage_file_name(file_name):
    ext = f".{get_ext(file_name)}"
    result = FILE_SYSTEM.get_alternative_name('storage', ext)
    return result


def check_request_file(req):
    try:
        return 'file' in req.FILES
    except:
        return False


public_file_fields = [
    'id',
    'owner',
    'size',
    'origin_name',
    'custom_name',
    'created_at',
    'downloaded_at',
    'comment'
]