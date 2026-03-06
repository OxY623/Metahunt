# app/auth/models.py
# Зачем хранить refresh token в БД?
# Чтобы можно было его отозвать (logout, смена пароля, подозрительная активность)
# JWT сам по себе нельзя "отозвать" — он валиден до истечения срока
# Храня токен в БД, мы можем проверить: "этот токен ещё активен?"
from datetime import datetime, timezone
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    user_id    = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True   # часто ищем по user_id (при логауте удаляем все токены юзера)
    )
    
    token      = Column(String, unique=True, nullable=False, index=True)
    # Храним сам токен чтобы проверить: "пришедший токен существует в БД?"
    
    is_revoked = Column(Boolean, default=False, nullable=False)
    # False — токен активен
    # True  — токен отозван (logout)
    # Зачем флаг вместо удаления? Для аудита: видим историю сессий
    
    expires_at = Column(DateTime(timezone=True), nullable=False)
    # Дублируем дату истечения из JWT
    # Можно периодически чистить БД: DELETE WHERE expires_at < NOW()
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User")