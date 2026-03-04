# app/game/router.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.game.service import GameService
from app.game.schemas import GameProfileResponse, ChooseArchetypeDto

router = APIRouter(prefix="/game", tags=["Game"])

def get_game_service(session: AsyncSession = Depends(get_session)) -> GameService:
    return GameService(session)

# GET /api/v1/game/profile — получить свой игровой профиль
@router.get("/profile", response_model=GameProfileResponse)
async def get_profile(
    # current_user = Depends(get_current_user)  ← после auth модуля
    service: GameService = Depends(get_game_service),
):
    pass

# POST /api/v1/game/archetype — выбрать архетип (один раз)
@router.post("/archetype", response_model=GameProfileResponse)
async def choose_archetype(
    dto: ChooseArchetypeDto,
    service: GameService = Depends(get_game_service),
):
    pass