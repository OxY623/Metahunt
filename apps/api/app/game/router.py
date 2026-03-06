# app/game/router.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.game.service import GameService
from app.game.schemas import GameProfileResponse, ChooseArchetypeDto

router = APIRouter(prefix="/game", tags=["Game"])


def get_game_service(session: AsyncSession = Depends(get_session)) -> GameService:
    return GameService(session)


@router.get("/profile", response_model=GameProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    return service.build_response(profile)


@router.post("/archetype", response_model=GameProfileResponse)
async def choose_archetype(
    dto: ChooseArchetypeDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.choose_archetype(current_user.id, dto)
    return service.build_response(profile)