from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, Literal
from uuid import UUID

EffectType = Literal["glitch", "ban", "shield"]

# In-memory effect registry. This is MVP-friendly and avoids schema changes.
# It resets on server restart and is per-process.
_EFFECTS: Dict[UUID, Dict[EffectType, datetime]] = {}


def set_effect(user_id: UUID, effect: EffectType, duration_seconds: int) -> None:
    expires_at = datetime.now(tz=timezone.utc) + timedelta(seconds=duration_seconds)
    user_effects = _EFFECTS.setdefault(user_id, {})
    user_effects[effect] = expires_at


def get_effects(user_id: UUID) -> Dict[EffectType, datetime]:
    now = datetime.now(tz=timezone.utc)
    user_effects = _EFFECTS.get(user_id, {})
    # Drop expired
    expired = [k for k, v in user_effects.items() if v <= now]
    for k in expired:
        user_effects.pop(k, None)
    if not user_effects:
        _EFFECTS.pop(user_id, None)
    return dict(user_effects)


def is_active(user_id: UUID, effect: EffectType) -> bool:
    effects = get_effects(user_id)
    return effect in effects


def get_effects_payload(user_id: UUID) -> list[dict]:
    effects = get_effects(user_id)
    payload = []
    for effect, expires_at in effects.items():
        payload.append(
            {
                "effect": effect,
                "expires_at": expires_at.isoformat(),
            }
        )
    return payload

