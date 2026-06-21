import os


os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://metahunt:metahunt@localhost:5432/metahunt_ci",
)
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ALGORITHM", "HS256")


def test_app_metadata():
    from main import app

    assert app.title == "MetaHunt API"
