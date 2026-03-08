from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_admin
from app.users.models import User, Role
from app.users.repository import UserRepository
from app.game.schemas import UserWithGameResponse


router = APIRouter(prefix="/admin", tags=["Admin"])


def get_admin_repo(session: AsyncSession = Depends(get_session)) -> UserRepository:
    return UserRepository(session)


@router.get("/users", response_model=list[UserWithGameResponse])
async def list_users(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _: User = Depends(get_current_admin),
    repo: UserRepository = Depends(get_admin_repo),
):
    """Список пользователей с игровым профилем (только для ADMIN)."""
    users = await repo.list_with_profile(limit=limit, offset=offset)
    return users


class UpdateRoleDto(BaseModel):
    role: Role


@router.patch("/users/{user_id}/role", response_model=UserWithGameResponse)
async def update_user_role(
    user_id: UUID,
    dto: UpdateRoleDto,
    _: User = Depends(get_current_admin),
    repo: UserRepository = Depends(get_admin_repo),
):
    """Изменить роль пользователя (USER/ADMIN)."""
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    updated = await repo.update(user, {"role": dto.role})
    return updated

