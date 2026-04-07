# app/chat/router.py

import json
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.chat.service import ChatService
from app.chat.effects import is_active, get_effects_payload
from app.chat.schemas import MessageCreate, MessageResponse
from app.game.service import GameService
from app.chat.models import Message

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_chat_service(session: AsyncSession = Depends(get_session)) -> ChatService:
    return ChatService(session)


def get_game_service(session: AsyncSession = Depends(get_session)) -> GameService:
    return GameService(session)


def _is_whisper_visible(msg: Message, current_user_id: UUID) -> bool:
    if msg.effect != "whisper":
        return True
    if msg.sender_id == current_user_id:
        return True
    if not msg.effect_payload:
        return False
    try:
        payload = json.loads(msg.effect_payload)
    except json.JSONDecodeError:
        return False
    target_id = payload.get("target_id")
    return str(target_id) == str(current_user_id)


@router.get("/messages", response_model=list[MessageResponse])
async def get_messages(
    room: str = Query(default="general", min_length=1, max_length=64),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    messages = await service.list_messages(room=room, limit=limit, offset=offset)
    messages = [m for m in messages if _is_whisper_visible(m, current_user.id)]
    await service.session.commit()
    return [service.to_response(m) for m in messages]


@router.post("/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    dto: MessageCreate,
    current_user: User = Depends(get_current_user),
    chat: ChatService = Depends(get_chat_service),
    game: GameService = Depends(get_game_service),
):
    profile = await game.get_or_create_profile(current_user.id)
    if is_active(current_user.id, "ban"):
        raise HTTPException(status_code=403, detail="Порт заблокирован на 1 минуту")
    await game.spend_energy(profile, 1)
    msg = await chat.send_message(current_user, dto, is_anonymous=False)
    await chat.session.commit()
    res = chat.to_response(msg)
    res.effect_payload = str(get_effects_payload(current_user.id))
    return res


@router.get("/effects")
async def get_effects(
    current_user: User = Depends(get_current_user),
):
    return {"effects": get_effects_payload(current_user.id)}
