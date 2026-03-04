# app/users/models.py

import uuid                    # стандартная библиотека Python для генерации UUID
from datetime import datetime  # для работы с датой и временем
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
# Column — описывает колонку таблицы
# String, Boolean, DateTime — типы данных колонок
# Enum — перечисление (как "USER" или "ADMIN"), SAEnum чтобы не конфликтовать с Python enum

from sqlalchemy.dialects.postgresql import UUID
# UUID тип специфичный для PostgreSQL
# В других БД (MySQL) UUID хранится иначе, поэтому импорт из dialects.postgresql

from sqlalchemy.orm import relationship
# relationship — описывает связи между таблицами
# Например: у одного User много Tickets

import enum                    # стандартный Python enum
from app.database import Base  # наш базовый класс

# Перечисление ролей
# str — наследуем от str чтобы можно было сравнивать: role == "USER"
class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class User(Base):              # наследуемся от Base — SQLAlchemy знает что это таблица
    __tablename__ = "users"    # имя таблицы в PostgreSQL

    # UUID как первичный ключ вместо обычного integer id
    # Зачем? UUID нельзя угадать (в отличие от 1, 2, 3...)
    # Это безопаснее: пользователь не может перебрать чужие id
    # default=uuid.uuid4 — автоматически генерируется при создании записи
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    email = Column(String, unique=True, nullable=False, index=True)
    # unique=True — два пользователя не могут иметь один email
    # nullable=False — поле обязательно (NOT NULL в SQL)
    # index=True — создаёт индекс в БД для быстрого поиска по email
    
    password_hash = Column(String, nullable=False)
    # Храним НЕ пароль, а его хэш через bcrypt
    # Даже если БД утечёт — пароли не раскроются
    
    nickname = Column(String, unique=True, nullable=False, index=True)
    
    avatar = Column(String, nullable=True)
    # nullable=True — аватар необязателен, может быть NULL
    
    verified = Column(Boolean, default=False)
    # False — email ещё не подтверждён
    # После клика по ссылке в письме становится True
    
    role = Column(SAEnum(Role), default=Role.USER, nullable=False)
    # По умолчанию все пользователи — USER
    # ADMIN устанавливается вручную
    
    created_at = Column(DateTime, default=datetime.utcnow)
    # datetime.utcnow — время в UTC (не локальное!)
    # UTC — стандарт для серверов, фронт сам конвертирует в локальное время
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # onupdate — автоматически обновляется при каждом изменении записи
    
    # Связь один-к-одному с игровым профилем
    # cascade="all, delete-orphan" — если удалим User, GameProfile удалится автоматически
    game_profile = relationship(
        "GameProfile",
        back_populates="user",
        userlist=False,
        cascade="all, delete-orphan"
    )
    # Relationships — SQLAlchemy подгружает связанные объекты автоматически
    # back_populates — двусторонняя связь: balance.user тоже будет работать
    # uselist=False — у пользователя ОДИН баланс (не список)
    balance = relationship("Balance", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")