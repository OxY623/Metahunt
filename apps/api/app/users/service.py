# app/users/service.py

from uuid import UUID
from passlib.context import CryptContext

from app.users.repository import UserRepository
from app.users.models import User
from app.users.schemas import UserResponse, UserUpdate, ChangePassword, UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, dto: UserCreate) -> User:
        password_hash = pwd_context.hash(dto.password)
        return await self.repo.create(
            email=dto.email,
            password_hash=password_hash,
            nickname=dto.nickname,
        )

    async def findByEmailRaw(self, email: str) -> User | None:
        return await self.repo.get_by_email(email)

    async def get_me(self, user_id: UUID) -> User | None:
        return await self.repo.get_by_id(user_id)

    async def update_profile(self, user: User, dto: UserUpdate) -> User:
        data = dto.model_dump(exclude_unset=True)
        if data:
            return await self.repo.update(user, data)
        return user

    async def change_password(
        self, user_id: UUID, dto: ChangePassword
    ) -> None:
        # TODO: проверить current_password, захешировать new_password, обновить в БД
        pass
