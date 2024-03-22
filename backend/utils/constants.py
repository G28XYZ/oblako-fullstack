

error_messages = {
    "unique_user": lambda field: f'Пользователь с таким {field} уже существует',
}

def create_response_data(data, type='success'):
    if type == 'error':
        return { "errors": data, "success": False }
    if 'password' in data:
        del data['password']
    return { "data": data, "success": True }