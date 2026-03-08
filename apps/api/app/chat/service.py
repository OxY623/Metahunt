# app/chat/service.py

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.chat.models import Message
from app.chat.schemas import MessageCreate, MessageResponse
from app.users.models import User


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_messages(self, room: str = "general", limit: int = 100, offset: int = 0) -> list[Message]:
        stmt = (
            select(Message)
            .options(selectinload(Message.sender))
            .where(Message.room == room)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def send_message(self, sender: User, dto: MessageCreate, is_anonymous: bool = False) -> Message:
        msg = Message(
            sender_id=sender.id,
            room=dto.room,
            text=dto.text.strip(),
            is_anonymous=is_anonymous,
        )
        self.session.add(msg)
        await self.session.flush()
        await self.session.refresh(msg)
        return msg

    def to_response(self, msg: Message) -> MessageResponse:
        sender_nickname = None if msg.is_anonymous else (msg.sender.nickname if msg.sender else None)
        sender_id = None if msg.is_anonymous else msg.sender_id
        return MessageResponse(
            id=msg.id,
            sender_id=sender_id,
            sender_nickname=sender_nickname,
            room=msg.room,
            text=msg.text,
            is_anonymous=msg.is_anonymous,
            created_at=msg.created_at,
        )
