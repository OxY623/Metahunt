from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.posts.schemas import CreatePostDto, CreatePostResponse, FeedResponse, PostResponse
from app.posts.service import PostsService
from app.users.models import User

router = APIRouter(prefix="/posts", tags=["Posts"])


def get_posts_service(session: AsyncSession = Depends(get_session)) -> PostsService:
    return PostsService(session)


@router.get("/feed", response_model=FeedResponse)
async def get_feed(
    cursor: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    service: PostsService = Depends(get_posts_service),
):
    _ = current_user
    items, next_cursor, mode = await service.list_feed(cursor, limit)
    return FeedResponse(items=items, next_cursor=next_cursor, mode=mode)


@router.post("", response_model=CreatePostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    dto: CreatePostDto,
    current_user: User = Depends(get_current_user),
    service: PostsService = Depends(get_posts_service),
):
    post, shards_spent, profile, task_rewards = await service.create_post(current_user, dto)
    return CreatePostResponse(
        post=service.to_response(post),
        shards_spent=shards_spent,
        shards_rewarded=sum(item.delta for item in task_rewards if item.delta > 0),
        shards_balance=profile.shards,
        energy_after=profile.energy,
        task_rewards=[item.meta.get("key") for item in task_rewards if item.meta],
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    service: PostsService = Depends(get_posts_service),
):
    _ = current_user
    post = await service.get_post_or_404(post_id)
    return service.to_response(post)
