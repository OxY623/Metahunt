from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITM: str = "HS256"
    ACCESS_TOKEN_EXPIRE: int = 30
    REFRESH_TOKEN: int = 7

    class Config:
        env_file = ".env"

settings = Settings()