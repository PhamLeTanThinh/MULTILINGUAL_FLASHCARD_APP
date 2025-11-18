from sqlalchemy.orm import Session
from datetime import datetime
from ..database import SessionLocal
from .. import crud
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def cleanup_inactive_users():
    """
    Xóa tất cả users không hoạt động quá 30 ngày
    Chạy task này định kỳ (có thể dùng APScheduler hoặc cron job)
    """
    db = SessionLocal()
    try:
        # Lấy danh sách users không hoạt động
        inactive_users = crud.get_inactive_users(db, days=30)
        
        if not inactive_users:
            logger.info("No inactive users to delete")
            return
        
        deleted_count = 0
        for user in inactive_users:
            logger.info(f"Deleting inactive user: {user.name} (ID: {user.id})")
            logger.info(f"Last activity: {user.last_activity_at}")
            
            # Xóa user và tất cả data liên quan
            success = crud.delete_user_cascade(db, user.id)
            if success:
                deleted_count += 1
        
        logger.info(f"Cleanup completed: {deleted_count} users deleted")
        return deleted_count
    
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def get_cleanup_stats(db: Session):
    """
    Lấy thống kê về users sắp bị xóa
    """
    from datetime import timedelta
    from sqlalchemy import and_
    
    now = datetime.utcnow()
    
    # Users sẽ bị xóa trong 7 ngày tới
    warning_threshold = now - timedelta(days=23)  # 30 - 7 = 23
    deletion_threshold = now - timedelta(days=30)
    
    users_at_risk = db.query(crud.models.User).filter(
        and_(
            crud.models.User.last_activity_at < warning_threshold,
            crud.models.User.last_activity_at >= deletion_threshold
        )
    ).all()
    
    users_to_delete = crud.get_inactive_users(db, days=30)
    
    return {
        "users_at_risk_7_days": len(users_at_risk),
        "users_to_delete_now": len(users_to_delete),
        "details": [
            {
                "id": user.id,
                "name": user.name,
                "last_activity": user.last_activity_at,
                "days_inactive": (now - user.last_activity_at).days,
                "days_until_deletion": crud.get_days_until_deletion(user)
            }
            for user in users_at_risk + users_to_delete
        ]
    }