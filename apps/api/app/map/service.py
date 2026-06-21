from datetime import datetime, timedelta
import math
import re

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

SEARCH_PRESETS = {
    "minsk": (53.9023, 27.5619, "Minsk"),
    "минск": (53.9023, 27.5619, "Минск"),
    "warsaw": (52.2297, 21.0122, "Warsaw"),
    "варшава": (52.2297, 21.0122, "Варшава"),
    "vilnius": (54.6872, 25.2797, "Vilnius"),
    "вильнюс": (54.6872, 25.2797, "Вильнюс"),
    "kyiv": (50.4501, 30.5234, "Kyiv"),
    "киев": (50.4501, 30.5234, "Киев"),
    "київ": (50.4501, 30.5234, "Київ"),
    "new york": (40.7128, -74.0060, "New York"),
    "нью-йорк": (40.7128, -74.0060, "Нью-Йорк"),
}


def _geo_to_tile_id(lat: float, lng: float) -> str:
    x = int((lat + 90.0) * 10)
    y = int((lng + 180.0) * 10)
    return f"x{x}y{y}"


def _tile_id_to_geo(tile_id: str) -> tuple[float, float] | None:
    match = re.match(r"^x(-?\d+)y(-?\d+)$", tile_id, re.IGNORECASE)
    if not match:
        return None
    x = int(match.group(1))
    y = int(match.group(2))
    return x / 10 - 90 + 0.05, y / 10 - 180 + 0.05


def _parse_bbox(bbox: str | None) -> tuple[float, float, float, float] | None:
    if not bbox:
        return None
    try:
        south, west, north, east = [float(part.strip()) for part in bbox.split(",")]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="invalid_bbox") from exc
    if south > north or west > east:
        raise HTTPException(status_code=400, detail="invalid_bbox")
    return south, west, north, east


def _point_in_bbox(lat: float, lng: float, bbox: tuple[float, float, float, float] | None) -> bool:
    if bbox is None:
        return True
    south, west, north, east = bbox
    return south <= lat <= north and west <= lng <= east


def _bbox_around(lat: float, lng: float, radius_deg: float) -> str:
    south = max(-90.0, lat - radius_deg)
    west = max(-180.0, lng - radius_deg)
    north = min(90.0, lat + radius_deg)
    east = min(180.0, lng + radius_deg)
    return f"{south:.6f},{west:.6f},{north:.6f},{east:.6f}"


def _cluster_cell_size(zoom: int | None) -> float:
    if zoom is None or zoom < 8:
        return 1.2
    if zoom < 11:
        return 0.6
    if zoom < 14:
        return 0.25
    return 0.1


def _dominant(values: list[str | None]) -> str | None:
    counts: dict[str, int] = {}
    for value in values:
        if value:
            counts[value] = counts.get(value, 0) + 1
    if not counts:
        return None
    return max(counts.items(), key=lambda item: item[1])[0]


def _parse_search_query(query: str) -> tuple[float, float, str]:
    q = query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="empty_query")

    coord_match = re.match(r"^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$", q)
    if coord_match:
        lat = float(coord_match.group(1))
        lng = float(coord_match.group(2))
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            raise HTTPException(status_code=400, detail="coordinates_out_of_range")
        return lat, lng, f"{lat:.5f}, {lng:.5f}"

    preset = SEARCH_PRESETS.get(q.lower())
    if preset:
        return preset

    raise HTTPException(
        status_code=404,
        detail="location_not_found_use_coordinates_or_known_city",
    )


class MapService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.game = GameService(session)

    async def list_tiles(self, bbox: str | None, _zoom: int | None, limit: int = 200):
        stmt = select(GeoTile).order_by(GeoTile.last_activity_at.desc())
        tiles = list((await self.session.execute(stmt)).scalars().all())
        parsed_bbox = _parse_bbox(bbox)
        if parsed_bbox:
            tiles = [
                tile
                for tile in tiles
                if (point := _tile_id_to_geo(tile.tile_id)) and _point_in_bbox(point[0], point[1], parsed_bbox)
            ]
        return tiles[:limit], get_mode()

    async def list_clusters(self, bbox: str | None, zoom: int | None, limit: int = 500):
        tiles, mode = await self.list_tiles(bbox, zoom, limit=limit)
        return self._cluster_tiles(tiles, zoom), mode

    def _cluster_tiles(self, tiles: list[GeoTile], zoom: int | None):
        cell = _cluster_cell_size(zoom)
        buckets: dict[tuple[int, int], list[tuple[GeoTile, float, float]]] = {}
        for tile in tiles:
            point = _tile_id_to_geo(tile.tile_id)
            if not point:
                continue
            lat, lng = point
            key = (math.floor((lat + 90.0) / cell), math.floor((lng + 180.0) / cell))
            buckets.setdefault(key, []).append((tile, lat, lng))

        clusters = []
        for key, items in buckets.items():
            total_weight = sum(max(0.05, min(1.0, tile.intensity or 0.0)) for tile, _, _ in items)
            lat = sum(lat * max(0.05, min(1.0, tile.intensity or 0.0)) for tile, lat, _ in items) / total_weight
            lng = sum(lng * max(0.05, min(1.0, tile.intensity or 0.0)) for tile, _, lng in items) / total_weight
            intensity = min(1.0, sum(tile.intensity or 0.0 for tile, _, _ in items) / max(1, len(items)))
            tile_ids = [tile.tile_id for tile, _, _ in items]
            clusters.append(
                {
                    "id": f"c{key[0]}_{key[1]}",
                    "lat": round(lat, 6),
                    "lng": round(lng, 6),
                    "count": len(items),
                    "intensity": round(intensity, 3),
                    "dominant_archetype": _dominant([tile.dominant_archetype for tile, _, _ in items]),
                    "tile_ids": tile_ids,
                }
            )
        return sorted(clusters, key=lambda item: (item["count"], item["intensity"]), reverse=True)

    async def search(self, query: str, zoom: int | None):
        lat, lng, label = _parse_search_query(query)
        next_zoom = zoom or 12
        radius = 0.08 if next_zoom >= 13 else 0.18 if next_zoom >= 11 else 0.45
        bbox = _bbox_around(lat, lng, radius)
        tiles, mode = await self.list_tiles(bbox, next_zoom, limit=500)
        return {
            "query": query,
            "label": label,
            "center": {"lat": lat, "lng": lng},
            "bbox": bbox,
            "zoom": next_zoom,
            "clusters": self._cluster_tiles(tiles, next_zoom),
            "tiles": tiles,
            "mode": mode,
        }

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
        task_reward = await self.game.grant_task_reward(
            profile,
            "geo_first_checkin",
            {"trigger": "map_checkin", "tile_id": tile_id},
        )

        await self.session.commit()
        await self.session.refresh(profile)

        return {
            "tile_id": tile_id,
            "visibility": dto.visibility,
            "next_allowed_at": now + CHECKIN_COOLDOWN,
            "energy_after": profile.energy,
            "shards_rewarded": task_reward.delta if task_reward else 0,
            "shards_balance": profile.shards,
            "task_rewards": [task_reward.meta.get("key")] if task_reward and task_reward.meta else [],
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

        await self.game.subtract_shards(
            profile,
            shards_cost,
            "skill_cost",
            {"source": "map_ping", "ping_type": dto.ping_type, "tile_id": dto.tile_id},
        )
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
        task_reward = None
        if profile.archetype and profile.archetype.value == "OXY" and dto.ping_type == "hunt":
            task_reward = await self.game.grant_task_reward(
                profile,
                "oxy_mark_tile",
                {"trigger": "map_ping:hunt", "tile_id": dto.tile_id},
            )

        await self.session.commit()
        await self.session.refresh(event)
        await self.session.refresh(profile)

        return {
            "ping_id": event.id,
            "ping_type": dto.ping_type,
            "tile_id": dto.tile_id,
            "effect_until": now + PING_EFFECT,
            "shards_spent": shards_cost,
            "shards_rewarded": task_reward.delta if task_reward else 0,
            "shards_balance": profile.shards,
            "task_rewards": [task_reward.meta.get("key")] if task_reward and task_reward.meta else [],
        }
