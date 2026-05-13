# app/game/router.py

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth.dependencies import get_current_user
from app.balance import cost
from app.users.models import User
from app.game.service import GameService
from app.game.schemas import (
    ChooseArchetypeDto,
    FactionPulseResponse,
    GameProfileResponse,
    QuestRewardDto,
    ShardLedgerResponse,
    ShardRewardResponse,
    TargetDto,
    WhisperDto,
)
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


@router.get("/shards/ledger", response_model=list[ShardLedgerResponse])
async def get_shards_ledger(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    return await service.list_ledger(current_user.id, limit=20)


@router.get("/factions/pulse", response_model=FactionPulseResponse)
async def get_faction_pulse(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    return await service.faction_pulse(current_user.id)


@router.post("/rewards/daily-login", response_model=ShardRewardResponse)
async def claim_daily_login(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile, ledger = await service.claim_daily_login(current_user.id)
    if ledger is None:
        return {"msg": "Ежедневная награда уже получена.", "delta": 0, "balance": profile.shards, "ledger": None}
    return {"msg": "+10 Осколков за вход.", "delta": ledger.delta, "balance": profile.shards, "ledger": ledger}


@router.post("/rewards/quest", response_model=ShardRewardResponse)
async def claim_quest_reward(
    dto: QuestRewardDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile, ledger = await service.claim_quest_reward(current_user.id, dto.quest_key)
    if ledger is None:
        return {"msg": "Лимит награды за этот квест на сегодня исчерпан.", "delta": 0, "balance": profile.shards, "ledger": None}
    return {"msg": f"+{ledger.delta} Осколков за квест.", "delta": ledger.delta, "balance": profile.shards, "ledger": ledger}


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
        tax = cost("visit_tax")
        split = await service.apply_tax_split(
            visitor,
            tax,
            "tax",
            {
                "source": "oxy_foxy_visit",
                "target_id": str(target.user_id),
                "source_archetype": visitor.archetype.value,
                "target_archetype": target.archetype.value,
            },
            fox_share=True,
        )
        await service.session.commit()
        return {
            "msg": "Медведь взял налог за вход. Часть ушла Лисе.",
            "shards_lost": tax,
            **split,
        }

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
    skill_cost = cost("skill_glitch")
    await service.subtract_shards(
        profile,
        skill_cost,
        "skill_cost",
        {"skill": "glitch", "target_id": str(target.user_id)},
    )
    set_effect(dto.target_id, "glitch", 30)
    reward = await service.grant_counter_reward(profile, target, "glitch")
    await service.session.commit()
    return {
        "msg": "Экран цели заглючен на 30 секунд.",
        "shards_spent": skill_cost,
        "shards_rewarded": reward.delta if reward else 0,
        "shards_balance": profile.shards,
    }


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
    skill_cost = cost("skill_direct_strike")
    await service.subtract_shards(
        profile,
        skill_cost,
        "skill_cost",
        {"skill": "direct_strike", "target_id": str(target.user_id)},
    )
    target.xp = max(0, target.xp - 5)
    reward = await service.grant_counter_reward(profile, target, "direct_strike")
    await service.session.commit()
    return {
        "msg": "Прямой удар нанесён. Противник потерял 5 XP.",
        "shards_spent": skill_cost,
        "shards_rewarded": reward.delta if reward else 0,
        "shards_balance": profile.shards,
    }


@router.post("/skills/golden_shield")
async def skill_golden_shield(
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.BEAR, "Только Медведь ставит щит")
    skill_cost = max(1, int(cost("skill_golden_shield") * 0.8))
    await service.subtract_shards(
        profile,
        skill_cost,
        "skill_cost",
        {"skill": "golden_shield"},
    )
    set_effect(current_user.id, "shield", 300)
    await service.session.commit()
    return {"msg": "Золотой щит активирован на 5 минут.", "shards_spent": skill_cost, "shards_balance": profile.shards}


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
    skill_cost = cost("skill_ban")
    await service.subtract_shards(
        profile,
        skill_cost,
        "skill_cost",
        {"skill": "ban", "target_id": str(target.user_id)},
    )
    target.energy = max(0, target.energy - 10)
    set_effect(dto.target_id, "ban", 60)
    reward = await service.grant_counter_reward(profile, target, "ban")
    await service.session.commit()
    return {
        "msg": "Порт цели временно заблокирован (-10 энергии).",
        "shards_spent": skill_cost,
        "shards_rewarded": reward.delta if reward else 0,
        "shards_balance": profile.shards,
    }


@router.post("/skills/whisper")
async def skill_whisper(
    dto: WhisperDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
    chat: ChatService = Depends(get_chat_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.OWL, "Только Сова может шептать")
    skill_cost = cost("skill_whisper")
    await service.subtract_shards(
        profile,
        skill_cost,
        "skill_cost",
        {"skill": "whisper", "target_id": str(dto.target_id), "room": dto.room},
    )

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
        "shards_spent": skill_cost,
        "shards_balance": profile.shards,
        "payload": {"to": str(dto.target_id), "message_id": str(msg.id)},
    }


@router.post("/skills/owl_deal")
async def skill_owl_deal(
    dto: TargetDto,
    current_user: User = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
):
    profile = await service.get_or_create_profile(current_user.id)
    _require_archetype(profile, Archetype.OWL, "Только Сова торгует данными")
    target = await service.get_or_create_profile(dto.target_id)
    _require_target_archetype(target, "Цель ещё не выбрала архетип")
    if get_relation(profile.archetype, target.archetype) != RelationType.TRADE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сделка доступна только по торговой связи")
    ledger = await service.grant_owl_deal(profile, target)
    await service.session.commit()
    if ledger is None:
        return {
            "msg": "Лимит сделок Совы на сегодня исчерпан.",
            "shards_rewarded": 0,
            "shards_balance": profile.shards,
        }
    return {
        "msg": "Сова продала сигнал и получила Осколки.",
        "shards_rewarded": ledger.delta,
        "shards_balance": profile.shards,
    }
