import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class Archetype(str, enum.Enum):
    FOXY = "FOXY"   # Харизма, активность, влияние
    OXY  = "OXY"    # Стратегия, надежность, организация
    BEAR = "BEAR"   # Стойкость, сила, защита
    OWL  = "OWL"    # Интеллект, наблюдение, стратегия
    # None по дефолту в базе или до выбора фракции


class GameProfile(Base):
    __tablename__ = "game_profiles"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # ForeignKey к связи с таблицей users
    # ondelete="CASCADE" — при удалении user -> удаляем game_profile
    user_id    = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,        # Один юзер = один профиль
        nullable=False
    )

    # Фракция и архетип героя при инициализации
    # nullable=True — может отсутствовать, пока не выбран архетип
    archetype  = Column(SAEnum(Archetype), nullable=True, default=None)

    # --- Прогресс в игре ---
    level      = Column(Integer, default=1, nullable=False)
    xp         = Column(Integer, default=0, nullable=False)
    # xp_to_next вычисляется динамически в схемах, не хранится в БД

    # --- Характеристики (1.0 — 100.0) ---
    # Для FOXY приоритетны: charisma, influence, activity
    # Для OXY приоритетны:  strategy, reliability, organization
    charisma     = Column(Float, default=0.0, nullable=False)  # FOXY / OWL
    influence    = Column(Float, default=0.0, nullable=False)  # FOXY / OWL
    activity     = Column(Float, default=0.0, nullable=False)  # FOXY
    strategy     = Column(Float, default=0.0, nullable=False)  # OXY / OWL
    reliability  = Column(Float, default=0.0, nullable=False)  # OXY / BEAR
    organization = Column(Float, default=0.0, nullable=False)  # OXY / BEAR

    # --- Репутация ---
    reputation   = Column(Float, default=0.0, nullable=False)

    # --- Очки ---
    # В планах: общие сезонные очки каждые 2 недели
    season_points = Column(Integer, default=0, nullable=False)

    # --- Ресурсы ---
    shards      = Column(Integer, default=100, nullable=False)  # Внутриигровая валюта (осколки)
    energy      = Column(Integer, default=100, nullable=False)  # Лимит действий в день

    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Обратная связь с User
    user = relationship("User", back_populates="game_profile")
