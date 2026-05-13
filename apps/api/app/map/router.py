from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.map.schemas import (
    CheckinDto,
    CheckinResponse,
    MapClusterResponse,
    MapClustersResponse,
    MapSearchResponse,
    PingDto,
    PingResponse,
    TileResponse,
    TilesResponse,
)
from app.map.service import MapService
from app.users.models import User

router = APIRouter(prefix="/map", tags=["Map"])


def get_map_service(session: AsyncSession = Depends(get_session)) -> MapService:
    return MapService(session)


@router.get("/tiles", response_model=TilesResponse)
async def get_tiles(
    bbox: str | None = Query(default=None),
    zoom: int | None = Query(default=None, ge=0, le=24),
    service: MapService = Depends(get_map_service),
    _current_user: User = Depends(get_current_user),
):
    items, mode = await service.list_tiles(bbox, zoom)
    return TilesResponse(items=[TileResponse.model_validate(tile) for tile in items], mode=mode)


@router.get("/clusters", response_model=MapClustersResponse)
async def get_clusters(
    bbox: str | None = Query(default=None),
    zoom: int | None = Query(default=None, ge=0, le=24),
    service: MapService = Depends(get_map_service),
    _current_user: User = Depends(get_current_user),
):
    items, mode = await service.list_clusters(bbox, zoom)
    return MapClustersResponse(items=[MapClusterResponse(**item) for item in items], mode=mode)


@router.get("/search", response_model=MapSearchResponse)
async def search_location(
    q: str = Query(..., min_length=1, max_length=120),
    zoom: int | None = Query(default=12, ge=0, le=24),
    service: MapService = Depends(get_map_service),
    _current_user: User = Depends(get_current_user),
):
    payload = await service.search(q, zoom)
    return MapSearchResponse(
        query=payload["query"],
        label=payload["label"],
        center=payload["center"],
        bbox=payload["bbox"],
        zoom=payload["zoom"],
        clusters=[MapClusterResponse(**item) for item in payload["clusters"]],
        tiles=[TileResponse.model_validate(tile) for tile in payload["tiles"]],
    )


@router.post("/checkin", response_model=CheckinResponse)
async def checkin(
    dto: CheckinDto,
    current_user: User = Depends(get_current_user),
    service: MapService = Depends(get_map_service),
):
    payload = await service.checkin(current_user, dto)
    return CheckinResponse(**payload)


@router.post("/ping", response_model=PingResponse)
async def ping(
    dto: PingDto,
    current_user: User = Depends(get_current_user),
    service: MapService = Depends(get_map_service),
):
    payload = await service.ping(current_user, dto)
    return PingResponse(**payload)
