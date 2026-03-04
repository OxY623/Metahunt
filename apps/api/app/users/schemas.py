# app/users/schemas.py
# Schemas — это описание формата данных которые приходят и уходят через API
# Pydantic автоматически валидирует данные и возвращает понятные ошибки

from pydantic import BaseModel, EmailStr, Field, field_validator
# BaseModel — базовый класс всех схем
# EmailStr — специальный тип, проверяет что строка является валидным email
# Field — позволяет добавить правила к полю (min_length, max_length...)
# field_validator — декоратор для написания кастомной валидации

from uuid import UUID
from datetime import datetime
from typing import Optional    # Optional[str] = str или None
import re                      # регулярные выражения для валидации никнейма

class UserBase(BaseModel):
    # Базовая схема — общие поля для создания и обновления
    # Другие схемы наследуются от неё чтобы не дублировать код
    email: EmailStr
    nickname: str = Field(..., min_length=3, max_length=20)
    # ... (три точки) означает "поле обязательное"
    # min_length, max_length — автоматическая проверка длины

    @field_validator("nickname")
    @classmethod                          # метод класса, не экземпляра
    def nickname_alphanumeric(cls, v: str) -> str:
        # v — это значение поля которое пришло от пользователя
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            # ^ — начало строки, $ — конец
            # [a-zA-Z0-9_] — только буквы, цифры и подчёркивание
            raise ValueError("Ник: только буквы, цифры и _")
        return v                          # возвращаем значение если всё ок

class UserCreate(UserBase):
    # Схема для регистрации — наследует email и nickname из UserBase
    # Добавляет пароль (он нужен только при создании, не при обновлении)
    password: str = Field(..., min_length=8, max_length=64)

class UserUpdate(BaseModel):
    # Схема для обновления профиля
    # Optional — поля необязательные (можно обновить только nickname или только avatar)
    nickname: Optional[str] = Field(None, min_length=3, max_length=20)
    avatar: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str      # старый пароль для подтверждения личности
    new_password: str = Field(..., min_length=8, max_length=64)

class UserResponse(BaseModel):
    # Схема ответа — что API возвращает клиенту
    # ВАЖНО: здесь нет password_hash — никогда не отправляем пароль наружу
    id: UUID
    email: EmailStr
    nickname: str
    avatar: Optional[str]
    verified: bool
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}
    # from_attributes=True — позволяет создать схему из SQLAlchemy объекта
    # Без этого Pydantic не умеет читать атрибуты ORM моделей
    # Раньше это называлось orm_mode = True (Pydantic v1)