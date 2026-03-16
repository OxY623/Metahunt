# app/game/router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.game.service import GameService
from app.game.schemas import GameProfileResponse, ChooseArchetypeDto, TargetDto, WhisperDto
from app.game.models import Archetype
from app.chat.effects import set_effect

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


@router.post("/interact")
async def interact(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    visitor = await service.get_or_create_profile(current_user.id)
    target = await service.get_or_create_profile(dto.target_id)

    # Налог Медведя: Wolf → Fox
    if visitor.archetype == Archetype.OXY and target.archetype == Archetype.FOXY:
        tax = 10
        if visitor.shards < tax:
            raise HTTPException(status_code=400, detail="Недостаточно Осколков для визита")
        visitor.shards -= tax
        target.shards += int(tax * 0.3)
        await service.session.commit()
        return {"msg": "Медведь взял налог за вход. Ты обеднел.", "shards_lost": tax}

    await service.session.commit()
    return {"msg": "Визит засчитан."}


@router.post("/skills/glitch")
async def skill_glitch(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    if profile.archetype != Archetype.FOXY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только Лиса может глючить экраны")
    await service.spend_shards(profile, 15)
    set_effect(dto.target_id, "glitch", 30)
    await service.session.commit()
    return {"msg": "Экран Волка заглючен на 30 секунд.", "shards_spent": 15}


@router.post("/skills/direct_strike")
async def skill_direct_strike(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    if profile.archetype != Archetype.OXY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только Волк может бить напрямую")
    await service.spend_shards(profile, 5)
    target = await service.get_or_create_profile(dto.target_id)
    target.xp = max(0, target.xp - 5)
    await service.session.commit()
    return {"msg": "Прямой удар нанесён. Противник потерял 5 XP.", "shards_spent": 5}


@router.post("/skills/golden_shield")
async def skill_golden_shield(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    if profile.archetype != Archetype.BEAR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только Медведь ставит щит")
    await service.spend_shards(profile, 20)
    await service.session.commit()
    return {"msg": "Золотой щит активирован на 5 минут.", "shards_spent": 20}


@router.post("/skills/ban")
async def skill_ban(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    if profile.archetype != Archetype.BEAR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только Медведь может блокировать порт")
    await service.spend_shards(profile, 30)
    target = await service.get_or_create_profile(dto.target_id)
    target.energy = max(0, target.energy - 10)
    set_effect(dto.target_id, "ban", 60)
    await service.session.commit()
    return {"msg": "Порт цели временно заблокирован (−10 энергии).", "shards_spent": 30}


@router.post("/skills/whisper")
async def skill_whisper(
    dto: WhisperDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    if profile.archetype != Archetype.OWL:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только Сова может шептать")
    await service.spend_shards(profile, 20)
    await service.session.commit()
    return {"msg": "Шёпот отправлен анонимно.", "shards_spent": 20, "payload": {"to": str(dto.target_id), "text": dto.message}}
