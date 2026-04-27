from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.map.schemas import CheckinDto, CheckinResponse, PingDto, PingResponse, TileResponse, TilesResponse
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
