"""
MetaHunt API - FastAPI application.
Swagger: /api/docs, ReDoc: /api/redoc
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.users.router import router as users_router
from app.game.router import router as game_router
from app.auth.router import router as auth_router
from app.chat.router import router as chat_router
from app.admin.router import router as admin_router
from app.invites.router import router as invites_router
from app.map.router import router as map_router
from app.posts.router import router as posts_router

app = FastAPI(
    title="MetaHunt API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(game_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(invites_router, prefix="/api/v1")
app.include_router(map_router, prefix="/api/v1")
app.include_router(posts_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
