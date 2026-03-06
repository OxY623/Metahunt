# app/auth/utils.py
# JWT (JSON Web Token) — это подписанная строка вида header.payload.signature
# Сервер подписывает токен своим SECRET_KEY
# Клиент хранит токен и отправляет в каждом запросе
# Сервер проверяет подпись — если совпадает, токен валиден

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
# python-jose — библиотека для работы с JWT
# pip install python-jose[cryptography]

from uuid import UUID
from app.config import settings

def create_access_token(user_id: UUID) -> str:
    # Access token — короткоживущий (30 минут)
    # Хранится в памяти на фронте (НЕ в localStorage — уязвимость XSS)
    # Отправляется в заголовке: Authorization: Bearer <token>
    
    now = datetime.now(timezone.utc)  # всегда UTC!
    
    payload = {
        "sub": str(user_id),     # sub (subject) — стандартное поле JWT, id пользователя
        "type": "access",        # наш кастомный claim — тип токена
        "iat": now,              # issued at — когда выдан
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),  # когда истекает
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    # jwt.encode — подписывает payload секретным ключом
    # Результат: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature"

def create_refresh_token(user_id: UUID) -> str:
    # Refresh token — долгоживущий (7 дней)
    # Хранится в httpOnly cookie — JS не может его прочитать (защита от XSS)
    # Используется ТОЛЬКО для получения нового access token
    
    now = datetime.now(timezone.utc)
    
    payload = {
        "sub": str(user_id),
        "type": "refresh",       # отличаем от access token
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    # Декодируем и проверяем подпись токена
    # Если токен подделан или истёк — JWTError
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        # JWTError — общее исключение для:
        # - истёкший токен (ExpiredSignatureError)
        # - неверная подпись
        # - неверный формат
        raise  # пробрасываем дальше, обработаем в dependencies.py