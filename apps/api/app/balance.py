from app.config import settings
from app.game.models import Archetype

BALANCE_MODES = {"soft", "strict"}
DEFAULT_MODE = "strict"

MODE = settings.BALANCE_MODE if settings.BALANCE_MODE in BALANCE_MODES else DEFAULT_MODE

INVITE_LIMITS = {
    "soft": {
        Archetype.OXY: {"daily": 3, "storage": 10},
        Archetype.FOXY: {"daily": 5, "storage": 10},
        Archetype.BEAR: {"daily": 2, "storage": 10},
        Archetype.OWL: {"daily": 4, "storage": 10},
    },
    "strict": {
        Archetype.OXY: {"daily": 2, "storage": 6},
        Archetype.FOXY: {"daily": 4, "storage": 6},
        Archetype.BEAR: {"daily": 1, "storage": 6},
        Archetype.OWL: {"daily": 3, "storage": 6},
    },
}

INVITE_TTL_HOURS = {
    "soft": 72,
    "strict": 48,
}

INVITE_REWARD = {
    "soft": 20,
    "strict": 14,
}

INVITE_TAX_RATE = 0.2
FOX_TAX_SHARE = 0.3

COSTS = {
    "visit_tax": {"soft": 10, "strict": 13},
    "skill_glitch": {"soft": 15, "strict": 20},
    "skill_direct_strike": {"soft": 5, "strict": 7},
    "skill_golden_shield": {"soft": 20, "strict": 26},
    "skill_ban": {"soft": 30, "strict": 39},
    "skill_whisper": {"soft": 20, "strict": 26},
    "unban": {"soft": 60, "strict": 78},
    "bear_coffee": {"soft": 30, "strict": 39},
    "invite_purchase_base": {"soft": 25, "strict": 35},
    "invite_purchase_step": {"soft": 10, "strict": 15},
    "post_boost": {"soft": 20, "strict": 30},
    "post_anonymous": {"soft": 10, "strict": 13},
    "geo_ping": {"soft": 7, "strict": 10},
    "geo_intel": {"soft": 12, "strict": 16},
    "geo_mask": {"soft": 8, "strict": 11},
    "geo_checkpoint": {"soft": 15, "strict": 20},
    "geo_hide": {"soft": 5, "strict": 7},
}

ENERGY_COSTS = {
    "message": 1,
    "skill": 5,
    "interact": 3,
    "invite": 2,
    "post": 2,
    "map_ping": 3,
    "map_checkin": 2,
}


def get_mode() -> str:
    return MODE


def invite_limits(archetype: Archetype) -> dict:
    limits = INVITE_LIMITS.get(MODE, {}).get(archetype)
    if not limits:
        return {"daily": 0, "storage": 0}
    return limits


def invite_ttl_hours() -> int:
    return INVITE_TTL_HOURS.get(MODE, 48)


def invite_reward() -> int:
    return INVITE_REWARD.get(MODE, 14)


def cost(name: str) -> int:
    return COSTS.get(name, {}).get(MODE, 0)
