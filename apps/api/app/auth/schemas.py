# app/auth/schemas.py

from pydantic import BaseModel, EmailStr

class LoginDto(BaseModel):
    # Данные для входа
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    # Что возвращаем клиенту при логине/рефреше
    access_token: str
    token_type: str = "bearer"
    # token_type = "bearer" — стандарт OAuth2
    # Клиент отправляет: Authorization: Bearer <access_token>
    
    # refresh_token НЕ здесь — он идёт в httpOnly cookie
    # Это принципиально важно для безопасности

class RegisterDto(BaseModel):
    email: EmailStr
    password: str
    nickname: str