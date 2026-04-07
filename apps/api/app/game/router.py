# app/game/router.py

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.game.service import GameService
from app.game.schemas import GameProfileResponse, ChooseArchetypeDto, TargetDto, WhisperDto
from app.game.models import Archetype
from app.game.relations import get_relation, RelationType
from app.chat.effects import set_effect, is_active
from app.chat.service import ChatService
from app.chat.schemas import MessageCreate

router = APIRouter(prefix="/game", tags=["Game"])


def get_game_service(session: AsyncSession = Depends(get_session)) -> GameService:
    return GameService(session)


def get_chat_service(session: AsyncSession = Depends(get_session)) -> ChatService:
    return ChatService(session)


def _require_archetype(profile, archetype: Archetype, detail: str) -> None:
    if profile.archetype != archetype:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def _require_target_archetype(target, detail: str) -> None:
    if target.archetype is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _require_counter_relation(source, target, detail: str) -> None:
    if source.archetype is None or target.archetype is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    if get_relation(source.archetype, target.archetype) != RelationType.COUNTER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


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

    # Налог Медведя: OXY → FOXY
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
    _require_archetype(profile, Archetype.FOXY, "Только Лиса может глючить экраны")
    target = await service.get_or_create_profile(dto.target_id)
    _require_target_archetype(target, "Цель ещё не выбрала архетип")
    _require_counter_relation(profile, target, "Глитч работает только против OXY")
    if is_active(dto.target_id, "shield"):
        raise HTTPException(status_code=400, detail="Цель под Золотым Щитом")
    await service.spend_shards(profile, 15)
    set_effect(dto.target_id, "glitch", 30)
    await service.session.commit()
    return {"msg": "Экран цели заглючен на 30 секунд.", "shards_spent": 15}


@router.post("/skills/direct_strike")
async def skill_direct_strike(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.OXY, "Только Волк может бить напрямую")
    target = await service.get_or_create_profile(dto.target_id)
    _require_target_archetype(target, "Цель ещё не выбрала архетип")
    _require_counter_relation(profile, target, "Прямой удар работает только против BEAR")
    if is_active(dto.target_id, "shield"):
        raise HTTPException(status_code=400, detail="Цель под Золотым Щитом")
    await service.spend_shards(profile, 5)
    target.xp = max(0, target.xp - 5)
    await service.session.commit()
    return {"msg": "Прямой удар нанесён. Противник потерял 5 XP.", "shards_spent": 5}


@router.post("/skills/golden_shield")
async def skill_golden_shield(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.BEAR, "Только Медведь ставит щит")
    await service.spend_shards(profile, 20)
    set_effect(current_user.id, "shield", 300)
    await service.session.commit()
    return {"msg": "Золотой щит активирован на 5 минут.", "shards_spent": 20}


@router.post("/skills/ban")
async def skill_ban(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.BEAR, "Только Медведь может блокировать порт")
    target = await service.get_or_create_profile(dto.target_id)
    _require_target_archetype(target, "Цель ещё не выбрала архетип")
    _require_counter_relation(profile, target, "Блокировка работает только против FOXY")
    if is_active(dto.target_id, "shield"):
        raise HTTPException(status_code=400, detail="Цель под Золотым Щитом")
    await service.spend_shards(profile, 30)
    target.energy = max(0, target.energy - 10)
    set_effect(dto.target_id, "ban", 60)
    await service.session.commit()
    return {"msg": "Порт цели временно заблокирован (−10 энергии).", "shards_spent": 30}


@router.post("/skills/whisper")
async def skill_whisper(
    dto: WhisperDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
    chat: ChatService = Depends(get_chat_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.OWL, "Только Сова может шептать")
    await service.spend_shards(profile, 20)

    payload = json.dumps({"target_id": str(dto.target_id)})
    msg = await chat.send_message(
        current_user,
        MessageCreate(text=dto.message, room=dto.room),
        is_anonymous=True,
        effect="whisper",
        effect_payload=payload,
    )
    await chat.session.commit()
    await service.session.commit()
    return {
        "msg": "Шёпот отправлен анонимно.",
        "shards_spent": 20,
        "payload": {"to": str(dto.target_id), "message_id": str(msg.id)},
    }

