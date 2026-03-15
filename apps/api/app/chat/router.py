# app/chat/router.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.chat.service import ChatService
from app.chat.schemas import MessageCreate, MessageResponse
from app.game.service import GameService

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_chat_service(session: AsyncSession = Depends(get_session)) -> ChatService:
  return ChatService(session)


def get_game_service(session: AsyncSession = Depends(get_session)) -> GameService:
  return GameService(session)


@router.get("/messages", response_model=list[MessageResponse])
async def get_messages(
    room: str = Query(default="general", min_length=1, max_length=64),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    messages = await service.list_messages(room=room, limit=limit, offset=offset)
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
    await game.spend_energy(profile, 1)
    msg = await chat.send_message(current_user, dto, is_anonymous=False)
    await chat.session.commit()
    return chat.to_response(msg)
