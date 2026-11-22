from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.arcade.schemas import ArcadeOverviewResponse, ArcadeResultResponse, ArcadeScoreDto
from app.arcade.service import ArcadeService
from app.auth.dependencies import get_current_user
from app.database import get_session
from app.users.models import User

router = APIRouter(prefix="/arcade", tags=["Arcade"])
def get_service(session: AsyncSession = Depends(get_session)) -> ArcadeService: return ArcadeService(session)

@router.get("/overview", response_model=ArcadeOverviewResponse)
async def overview(current_user: User = Depends(get_current_user), service: ArcadeService = Depends(get_service)):
    return {"best_score": await service.best_score(current_user.id), "leaderboard": await service.leaderboard()}

@router.post("/runs", response_model=ArcadeResultResponse)
async def submit_run(dto: ArcadeScoreDto, current_user: User = Depends(get_current_user), service: ArcadeService = Depends(get_service)):
    return await service.submit(current_user, dto.score, dto.duration_seconds)
