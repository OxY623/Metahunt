from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.users.router import router as users_router
from app.game.router import router as game_router
app = FastAPI(
    title="MetaHunt API",
    version = "1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/api/v1")
app.include_router(game_router, prefix="/api/v1")
app.include_router(game_router,  prefix="/api/v1")



@app.get("/health")
def health():
    return {"status":"ok"}
