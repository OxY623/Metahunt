# app/users/router.py
# Router   HTTP .  :
# 1.  
# 2.  
# 3.  
#  -  

from fastapi import APIRouter, Depends, HTTPException
# APIRouter       
# Depends   dependency injection
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.service import UserService
from app.users.schemas import UserResponse, UserUpdate, ChangePassword
from app.users.dependencies import get_user_service
# from app.auth.dependencies import get_current_user     auth 

router = APIRouter(
    prefix="/users",      #      /users
    tags=["Users"],       #   Swagger 
)

@router.get(
    "/me",
    response_model=UserResponse,
    # response_model  FastAPI      
    #     ( password_hash    )
)
async def get_me(
    # current_user: User = Depends(get_current_user),     auth
    current_user: User = Depends(get_current_user), 
    service: UserService = Depends(get_user_service),
    # Depends()  FastAPI   UserService   
):
    user = await service.get_me(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch(
    "/profile",
    response_model=UserResponse,
)
async def update_profile(
    dto: UserUpdate,
    # dto: UserUpdate  FastAPI     (JSON)
    #     Pydantic.      422
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    return await service.update_profile(current_user, dto)

@router.patch(
    "/password",
    status_code=204,
    # 204 No Content     
    #       
)
async def change_password(
    dto: ChangePassword,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    await service.change_password(current_user.id, dto)
