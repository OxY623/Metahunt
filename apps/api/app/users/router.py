# app/users/router.py
# Router — это HTTP слой. Здесь только:
# 1. Принять запрос
# 2. Вызвать сервис
# 3. Вернуть ответ
# Никакой бизнес-логики здесь нет

from fastapi import APIRouter, Depends, HTTPException
# APIRouter — роутер для группировки эндпоинтов одного модуля
# Depends — для dependency injection
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.service import UserService
from app.users.schemas import UserResponse, UserUpdate, ChangePassword
from app.users.dependencies import get_user_service
# from app.auth.dependencies import get_current_user  ← добавим в auth модуле

router = APIRouter(
    prefix="/users",      # все эндпоинты будут начинаться с /users
    tags=["Users"],       # группировка в Swagger документации
)

@router.get(
    "/me",
    response_model=UserResponse,
    # response_model — FastAPI автоматически сериализует ответ по этой схеме
    # и уберёт лишние поля (например password_hash не попадёт в ответ)
)
async def get_me(
    # current_user: User = Depends(get_current_user),  ← после добавления auth
    current_user: User = Depends(get_current_user), 
    service: UserService = Depends(get_user_service),
    # Depends() — FastAPI сам создаст UserService со всеми зависимостями
):
    user = await service.get_me(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch(
    "/profile",
    response_model=UserResponse,
)
async def update_profile(
    dto: UserUpdate,
    # dto: UserUpdate — FastAPI автоматически читает тело запроса (JSON)
    # и валидирует его через Pydantic. Если данные невалидны — вернёт 422
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    return await service.update_profile(current_user, dto)

@router.patch(
    "/password",
    status_code=204,
    # 204 No Content — успешный ответ без тела
    # Стандарт для операций которые ничего не возвращают
)
async def change_password(
    dto: ChangePassword,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    await service.change_password(current_user.id, dto)
