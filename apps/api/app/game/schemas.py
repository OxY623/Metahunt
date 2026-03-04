# app/game/schemas.py

from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from app.game.models import Archetype


# --- Характеристики отдельным блоком ---
# Выносим в отдельную схему чтобы не дублировать поля
class Characteristics(BaseModel):
    charisma:     float
    influence:    float
    activity:     float
    strategy:     float
    reliability:  float
    organization: float

    model_config = {"from_attributes": True}


# --- Ответ: полный игровой профиль ---
class GameProfileResponse(BaseModel):
    id:            UUID
    archetype:     Optional[Archetype]   # None если ещё не выбрал
    level:         int
    xp:            int
    xp_to_next:    int                   # вычисляется в сервисе
    reputation:    float
    season_points: int
    stats:         Characteristics       # характеристики вложенным объектом

    model_config = {"from_attributes": True}


# --- Выбор архетипа (только один раз) ---
class ChooseArchetypeDto(BaseModel):
    archetype: Archetype                 # FOXY или OXY, валидируется автоматически


# --- UserResponse теперь включает game_profile ---
class UserWithGameResponse(BaseModel):
    id:           UUID
    email:        str
    nickname:     str
    avatar:       Optional[str]
    verified:     bool
    role:         str
    game_profile: Optional[GameProfileResponse]  # None если профиль ещё не создан

    model_config = {"from_attributes": True}