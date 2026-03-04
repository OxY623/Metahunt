# app/auth/service.py

from datetime import datetime, timedelta, timezone
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.auth.models import RefreshToken
from app.auth.utils import create_access_token, create_refresh_token, decode_token
from app.users.models import User
from app.users.service import UserService
from app.users.schemas import UserCreate
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, session: AsyncSession, user_service: UserService):
        self.session = session
        self.user_service = user_service
        # AuthService зависит от UserService — получает его через DI

    async def register(self, dto: UserCreate) -> User:
        # Регистрация — делегируем UserService
        # AuthService не знает деталей создания юзера
        user = await self.user_service.create_user(dto)
        
        # Здесь в будущем: отправка письма верификации
        # await email_service.send_verification(user.email)
        
        return user

    async def login(self, email: str, password: str) -> tuple[str, str]:
        # Возвращаем пару: (access_token, refresh_token)
        
        # Ищем юзера по email
        user = await self.user_service.findByEmailRaw(email)
        
        if not user:
            # Важно: одинаковое сообщение для "нет юзера" и "неверный пароль"
            # Иначе атакующий может перебором узнать какие email зарегистрированы
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный email или пароль")
        
        if not pwd_context.verify(password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный email или пароль")
        
        # Генерируем оба токена
        access_token  = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        # Сохраняем refresh token в БД
        await self._save_refresh_token(user.id, refresh_token)
        
        return access_token, refresh_token

    async def refresh(self, refresh_token: str) -> tuple[str, str]:
        # Клиент присылает refresh token (из cookie)
        # Мы проверяем его и выдаём новую пару токенов
        # Это называется "rotation" — каждый раз выдаём новый refresh token
        
        from jose import JWTError
        
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Невалидный токен")
        
        # Проверяем что это именно refresh, а не access
        if payload.get("type") != "refresh":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный тип токена")
        
        # Проверяем что токен существует в БД и не отозван
        db_token = await self._get_refresh_token(refresh_token)
        
        if not db_token or db_token.is_revoked:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Токен отозван")
        
        # Отзываем старый токен (rotation)
        db_token.is_revoked = True
        await self.session.commit()
        
        # Выдаём новую пару
        user_id       = UUID(payload["sub"])
        access_token  = create_access_token(user_id)
        new_refresh   = create_refresh_token(user_id)
        await self._save_refresh_token(user_id, new_refresh)
        
        return access_token, new_refresh

    async def logout(self, refresh_token: str) -> None:
        # Отзываем refresh token → пользователь разлогинен
        # Access token истечёт сам через 30 минут (это нормально)
        
        db_token = await self._get_refresh_token(refresh_token)
        if db_token:
            db_token.is_revoked = True
            await self.session.commit()

    async def logout_all(self, user_id: UUID) -> None:
        # Выход со всех устройств — отзываем ВСЕ токены пользователя
        # Используется при смене пароля или подозрительной активности
        await self.session.execute(
            delete(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            # DELETE FROM refresh_tokens WHERE user_id = ?
        )
        await self.session.commit()

    # --- Приватные методы ---

    async def _save_refresh_token(self, user_id: UUID, token: str) -> None:
        db_token = RefreshToken(
            user_id    = user_id,
            token      = token,
            expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE),
        )
        self.session.add(db_token)
        await self.session.commit()

    async def _get_refresh_token(self, token: str) -> RefreshToken | None:
        result = await self.session.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        return result.scalar_one_or_none()