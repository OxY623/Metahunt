# app/users/repository.py
# Repository — единственное место где пишутся SQL запросы
# Service не знает как устроена БД, он просто вызывает методы репозитория
# Это позволяет легко заменить PostgreSQL на другую БД не трогая бизнес-логику
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select    # select — строим SELECT запросы
from uuid import UUID
from app.users.models import User

class UserRepository:
    def __init__(self, session: AsyncSession):
        # session — подключение к БД, приходит через dependency injection
        self.session = session

    # async def create(self, email: str, password_hash: str, nickname: str) -> User:
    #     user = User(email=email, password_hash=password_hash, nickname=nickname)
    #     # Создаём объект модели — пока это просто Python объект, не запись в БД
        
    #     self.session.add(user)
    #     # add() — помечаем объект для сохранения (добавляем в "очередь")
        
    #     await self.session.commit()
    #     # commit() — выполняем INSERT в БД, транзакция завершается
    #     # await — потому что операция асинхронная (не блокирует сервер)
        
    #     await self.session.refresh(user)
    #     # refresh() — перечитываем объект из БД
    #     # Нужно чтобы получить id и created_at которые сгенерировала БД
        
    #     return user
    async def create(self, email: str, password_hash: str, nickname: str) -> User:
        user = User(email=email, password_hash=password_hash, nickname=nickname)
        self.session.add(user)
    
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise HTTPException(status_code=400, detail="Email or nickname already registered")
    
        await self.session.refresh(user)
        return user

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
            # SELECT * FROM users WHERE id = user_id
        )
        return result.scalar_one_or_none()
        # scalar_one_or_none() — вернёт объект если найден, None если нет
        # scalar_one() без _or_none бросил бы исключение если записи нет

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_nickname(self, nickname: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.nickname == nickname)
        )
        return result.scalar_one_or_none()

    async def update(self, user: User, data: dict) -> User:
        for key, value in data.items():
            setattr(user, key, value)
            # setattr(obj, "nickname", "newNick") эквивалентно obj.nickname = "newNick"
            # Перебираем словарь и устанавливаем каждое поле
        
        await self.session.commit()  # UPDATE в БД
        await self.session.refresh(user)
        return user