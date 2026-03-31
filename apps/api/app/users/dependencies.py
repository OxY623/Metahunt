# app/users/dependencies.py
# Dependency Injection (DI)        
# ,     .
# FastAPI    DI  Depends()

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session      #  - 
from app.users.repository import UserRepository
from app.users.service import UserService

def get_user_repository(
    session: AsyncSession = Depends(get_session)
    # Depends(get_session)  FastAPI:
    # "      get_session    "
    # FastAPI      
) -> UserRepository:
    return UserRepository(session)   #    

def get_user_service(
    repo: UserRepository = Depends(get_user_repository)
    #   : FastAPI  get_user_repository,  
    #     get_user_service
) -> UserService:
    return UserService(repo)

#    FastAPI     :
# get_session()  session
# get_user_repository(session)  repo  
# get_user_service(repo)  service
# router endpoint(service)   