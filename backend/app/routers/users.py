from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    """Lấy tất cả users với thông tin countdown"""
    users = crud.get_all_users(db)
    
    # Thêm thông tin countdown và deck count
    result = []
    for user in users:
        user_dict = {
            "id": user.id,
            "name": user.name,
            "avatar": user.avatar,
            "points": user.points,
            "theme": user.theme,
            "created_at": user.created_at,
            "last_activity_at": user.last_activity_at,
            "days_until_deletion": crud.get_days_until_deletion(user),
            "deck_count": len(user.decks)
        }
        result.append(user_dict)
    
    return result

@router.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin user và UPDATE activity"""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update activity mỗi khi truy cập user
    crud.update_user_activity(db, user_id)
    
    return {
        "id": user.id,
        "name": user.name,
        "avatar": user.avatar,
        "points": user.points,
        "theme": user.theme,
        "created_at": user.created_at,
        "last_activity_at": user.last_activity_at,
        "days_until_deletion": crud.get_days_until_deletion(user),
        "deck_count": len(user.decks)
    }

@router.post("", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Xóa user và tất cả data"""
    success = crud.delete_user_cascade(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User and all associated data deleted successfully"}

@router.post("/{user_id}/refresh-activity")
def refresh_user_activity(user_id: int, db: Session = Depends(get_db)):
    """Manually refresh user activity (cho testing)"""
    user = crud.update_user_activity(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "message": "Activity refreshed",
        "last_activity_at": user.last_activity_at,
        "days_until_deletion": crud.get_days_until_deletion(user)
    }