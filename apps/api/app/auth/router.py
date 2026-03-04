# app/auth/router.py

from fastapi import APIRouter, Depends, Response, Request, Cookie
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import AuthService
from app.auth.schemas import LoginDto, TokenResponse, RegisterDto
from app.auth.dependencies import get_current_user
from app.users.schemas import UserResponse
from app.users.models import User
from app.users.service import UserService
from app.users.repository import UserRepository
from app.database import get_session

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_auth_service(session: AsyncSession = Depends(get_session)) -> AuthService:
    repo         = UserRepository(session)
    user_service = UserService(repo)
    return AuthService(session, user_service)


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    dto: RegisterDto,
    service: AuthService = Depends(get_auth_service),
):
    return await service.register(dto)


@router.post("/login", response_model=TokenResponse)
async def login(
    dto: LoginDto,
    response: Response,          # Response — объект HTTP ответа, нужен для установки cookie
    service: AuthService = Depends(get_auth_service),
):
    access_token, refresh_token = await service.login(dto.email, dto.password)

    # Устанавливаем refresh token в httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,    # JS не может прочитать — защита от XSS атак
        secure=True,      # только по HTTPS (в dev можно False)
        samesite="lax",   # защита от CSRF атак
        max_age=7 * 24 * 60 * 60,  # 7 дней в секундах
        path="/api/v1/auth",  # cookie отправляется ТОЛЬКО на /auth эндпоинты
    )

    # Access token отдаём в теле ответа — фронт хранит в памяти (useState/zustand)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    # Cookie(default=None) — FastAPI читает cookie с именем "refresh_token"
    service: AuthService = Depends(get_auth_service),
):
    if not refresh_token:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Нет refresh токена")

    access_token, new_refresh = await service.refresh(refresh_token)

    # Обновляем cookie с новым refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/api/v1/auth",
    )

    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=204)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    service: AuthService = Depends(get_auth_service),
):
    if refresh_token:
        await service.logout(refresh_token)

    # Удаляем cookie — браузер больше не будет его отправлять
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    # get_current_user проверит токен и вернёт объект пользователя
    # Если токен невалиден — автоматически вернёт 401
):
    return current_user