# app/chat/router.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.chat.service import ChatService
from app.chat.schemas import MessageCreate, MessageResponse

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_chat_service(session: AsyncSession = Depends(get_session)) -> ChatService:
    return ChatService(session)


@router.get("/messages", response_model=list[MessageResponse])
async def get_messages(
    room: str = Query(default="general", min_length=1, max_length=64),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    """Список сообщений в комнате (общий чат)."""
    messages = await service.list_messages(room=room, limit=limit, offset=offset)
    await service.session.commit()
    return [service.to_response(m) for m in messages]


@router.post("/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    dto: MessageCreate,
    current_user: User = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    """Отправить сообщение в комнату. Тратит 1 энергию (docs: shards)."""
    msg = await service.send_message(current_user, dto, is_anonymous=False)
    await service.session.commit()
    return service.to_response(msg)
