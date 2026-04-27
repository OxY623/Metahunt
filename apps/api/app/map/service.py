from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.balance import ENERGY_COSTS, cost, get_mode
from app.game.service import GameService
from app.map.models import GeoEvent, GeoTile
from app.map.schemas import CheckinDto, PingDto
from app.users.models import User

CHECKIN_COOLDOWN = timedelta(minutes=30)
PING_COOLDOWN = timedelta(minutes=5)
PING_EFFECT = timedelta(minutes=15)


def _geo_to_tile_id(lat: float, lng: float) -> str:
    x = int((lat + 90.0) * 10)
    y = int((lng + 180.0) * 10)
    return f"x{x}y{y}"


class MapService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.game = GameService(session)

    async def list_tiles(self, _bbox: str | None, _zoom: int | None, limit: int = 200):
        stmt = select(GeoTile).order_by(GeoTile.last_activity_at.desc()).limit(limit)
        return list((await self.session.execute(stmt)).scalars().all()), get_mode()

    async def _last_event(self, user_id, event_filter: str):
        stmt = select(GeoEvent).where(GeoEvent.user_id == user_id)
        if event_filter.endswith("%"):
            stmt = stmt.where(GeoEvent.event_type.like(event_filter))
        else:
            stmt = stmt.where(GeoEvent.event_type == event_filter)
        stmt = stmt.order_by(GeoEvent.created_at.desc()).limit(1)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def checkin(self, current_user: User, dto: CheckinDto):
        profile = await self.game.get_or_create_profile(current_user.id)
        now = datetime.utcnow()

        last_checkin = await self._last_event(current_user.id, "checkin")
        if last_checkin and (now - last_checkin.created_at) < CHECKIN_COOLDOWN:
            raise HTTPException(status_code=409, detail="cooldown")

        energy_cost = int(ENERGY_COSTS.get("map_checkin", 2))
        if profile.energy < energy_cost:
            raise HTTPException(status_code=403, detail="energy_empty")

        profile.energy -= energy_cost
        profile.geo_visibility = dto.visibility

        tile_id = _geo_to_tile_id(dto.geo.lat, dto.geo.lng)
        profile.last_geo_tile = tile_id

        tile = await self.session.get(GeoTile, tile_id)
        if not tile:
            tile = GeoTile(tile_id=tile_id, intensity=0.0)
            self.session.add(tile)

        tile.intensity = min(1.0, (tile.intensity or 0.0) + 0.1)
        tile.last_activity_at = now
        tile.dominant_archetype = profile.archetype.value if profile.archetype else None

        event = GeoEvent(
            user_id=current_user.id,
            event_type="checkin",
            tile_id=tile_id,
            created_at=now,
        )
        self.session.add(event)

        await self.session.commit()
        await self.session.refresh(profile)

        return {
            "tile_id": tile_id,
            "visibility": dto.visibility,
            "next_allowed_at": now + CHECKIN_COOLDOWN,
            "energy_after": profile.energy,
        }

    async def ping(self, current_user: User, dto: PingDto):
        profile = await self.game.get_or_create_profile(current_user.id)
        now = datetime.utcnow()

        last_ping = await self._last_event(current_user.id, "ping:%")
        if last_ping and (now - last_ping.created_at) < PING_COOLDOWN:
            raise HTTPException(status_code=409, detail="cooldown")

        shards_cost = cost("geo_ping")
        if profile.shards < shards_cost:
            raise HTTPException(status_code=402, detail="not_enough_shards")

        energy_cost = int(ENERGY_COSTS.get("map_ping", 3))
        if profile.energy < energy_cost:
            raise HTTPException(status_code=403, detail="energy_empty")

        profile.shards -= shards_cost
        profile.energy -= energy_cost

        tile = await self.session.get(GeoTile, dto.tile_id)
        if not tile:
            tile = GeoTile(tile_id=dto.tile_id, intensity=0.0)
            self.session.add(tile)

        tile.intensity = min(1.0, (tile.intensity or 0.0) + 0.2)
        tile.last_activity_at = now
        tile.dominant_archetype = profile.archetype.value if profile.archetype else None

        event = GeoEvent(
            user_id=current_user.id,
            event_type=f"ping:{dto.ping_type}",
            tile_id=dto.tile_id,
            created_at=now,
        )
        self.session.add(event)

        await self.session.commit()
        await self.session.refresh(event)
        await self.session.refresh(profile)

        return {
            "ping_id": event.id,
            "ping_type": dto.ping_type,
            "tile_id": dto.tile_id,
            "effect_until": now + PING_EFFECT,
            "shards_spent": shards_cost,
            "shards_balance": profile.shards,
        }
