# app/game/models.py

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class Archetype(str, enum.Enum):
    FOXY = "FOXY"   # харизма, активность, ивенты
    OXY  = "OXY"    # стратегия, организация, аналитика
    # None на старте — игрок ещё не выбрал сторону


class GameProfile(Base):
    __tablename__ = "game_profiles"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # ForeignKey — связь с таблицей users
    # ondelete="CASCADE" — на уровне БД: удалили user → удалился game_profile
    user_id    = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,        # один игрок = один профиль
        nullable=False
    )

    # Архетип — выбирается один раз при онбординге
    # nullable=True — новый пользователь ещё не выбрал
    archetype  = Column(SAEnum(Archetype), nullable=True, default=None)

    # --- Уровень и опыт ---
    level      = Column(Integer, default=1, nullable=False)
    xp         = Column(Integer, default=0, nullable=False)
    # xp_to_next считается динамически в сервисе, не хранится в БД
    # Зачем? Если изменим формулу — не нужно пересчитывать все записи

    # --- Характеристики (1.0 — 100.0) ---
    # Float позволяет дробные значения: харизма 47.5
    # Для FOXY прокачиваются: charisma, influence, activity
    # Для OXY прокачиваются:  strategy, reliability, organization
    charisma     = Column(Float, default=0.0, nullable=False)  # FOXY
    influence    = Column(Float, default=0.0, nullable=False)  # FOXY
    activity     = Column(Float, default=0.0, nullable=False)  # FOXY
    strategy     = Column(Float, default=0.0, nullable=False)  # OXY
    reliability  = Column(Float, default=0.0, nullable=False)  # OXY
    organization = Column(Float, default=0.0, nullable=False)  # OXY

    # --- Репутация ---
    # Общая для всех архетипов, зарабатывается за активность на платформе
    reputation   = Column(Float, default=0.0, nullable=False)

    # --- Сезон ---
    # В будущем: сброс сезонных очков каждые 2 месяца
    season_points = Column(Integer, default=0, nullable=False)

    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Обратная связь к User
    user = relationship("User", back_populates="game_profile")