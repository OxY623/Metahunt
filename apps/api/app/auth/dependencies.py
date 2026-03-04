# app/auth/dependencies.py
# Это самый важный файл auth модуля
# get_current_user — зависимость которую подключают ВСЕ защищённые эндпоинты

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# HTTPBearer — читает токен из заголовка Authorization: Bearer <token>

from jose import JWTError
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.utils import decode_token
from app.users.models import User
from app.users.repository import UserRepository
from app.database import get_session

# Схема безопасности — FastAPI использует для Swagger UI
# auto_error=False — сами бросаем ошибку с нужным сообщением
bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    # Это исключение будем бросать в разных местах — выносим в переменную
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не авторизован",
        headers={"WWW-Authenticate": "Bearer"},
        # WWW-Authenticate — стандартный заголовок, говорит клиенту как авторизоваться
    )

    # Нет заголовка Authorization вообще
    if not credentials:
        raise credentials_error

    try:
        payload = decode_token(credentials.credentials)
        # credentials.credentials — это сам токен (без слова "Bearer")
    except JWTError:
        raise credentials_error

    # Проверяем тип токена — не должен быть refresh
    if payload.get("type") != "access":
        raise credentials_error

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_error

    # Проверяем что пользователь существует в БД
    # Зачем? Токен мог быть выдан удалённому пользователю
    repo = UserRepository(session)
    user = await repo.get_by_id(UUID(user_id))

    if not user:
        raise credentials_error

    return user  # этот объект придёт в эндпоинт как current_user


# Дополнительная зависимость для админских эндпоинтов
async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Недостаточно прав")
    return current_user
    # 403 Forbidden — пользователь авторизован, но нет прав
    # 401 Unauthorized — пользователь не авторизован вообще