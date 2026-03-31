# app/users/repository.py
# Repository      SQL 
# Service     ,     
#     PostgreSQL      -
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select    # select   SELECT 
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.users.models import User

class UserRepository:
    def __init__(self, session: AsyncSession):
        # session    ,   dependency injection
        self.session = session

    # async def create(self, email: str, password_hash: str, nickname: str) -> User:
    #     user = User(email=email, password_hash=password_hash, nickname=nickname)
    #     #        Python ,    
        
    #     self.session.add(user)
    #     # add()      (  "")
        
    #     await self.session.commit()
    #     # commit()   INSERT  ,  
    #     # await      (  )
        
    #     await self.session.refresh(user)
    #     # refresh()     
    #     #    id  created_at   
        
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
        # scalar_one_or_none()     , None  
        # scalar_one()  _or_none      

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
            # setattr(obj, "nickname", "newNick")  obj.nickname = "newNick"
            #      
        
        await self.session.commit()  # UPDATE  
        await self.session.refresh(user)
        return user

    async def list_with_profile(self, limit: int = 50, offset: int = 0) -> list[User]:
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.game_profile))
            .order_by(User.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())