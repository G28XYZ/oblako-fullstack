from rest_framework import serializers

def min_length(value, num, field=''):
    if len(value) < num:
        field = f' для {field} ' if len(field) > 0 else ' '
        raise serializers.ValidationError(f'Минимальное количество символов{field}должно быть {num}')