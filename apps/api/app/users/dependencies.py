# app/users/dependencies.py
# Dependency Injection (DI) — паттерн при котором объекты получают свои зависимости
# снаружи, а не создают их сами.
# FastAPI имеет встроенную систему DI через Depends()

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session      # наша функция-генератор сессии
from app.users.repository import UserRepository
from app.users.service import UserService

def get_user_repository(
    session: AsyncSession = Depends(get_session)
    # Depends(get_session) говорит FastAPI:
    # "перед вызовом этой функции — вызови get_session и передай результат сюда"
    # FastAPI сам управляет созданием и закрытием сессии
) -> UserRepository:
    return UserRepository(session)   # создаём репозиторий с сессией

def get_user_service(
    repo: UserRepository = Depends(get_user_repository)
    # То же самое: FastAPI вызовет get_user_repository, получит репозиторий
    # и передаст его в get_user_service
) -> UserService:
    return UserService(repo)         # создаём сервис с репозиторием

# Итоговая цепочка которую FastAPI строит автоматически при каждом запросе:
# get_session() → session
# get_user_repository(session) → repo  
# get_user_service(repo) → service
# router endpoint(service) → ответ клиенту