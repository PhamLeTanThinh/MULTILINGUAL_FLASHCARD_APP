from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import os

from .routers import users, decks, flashcards, dictionary, quiz, tts, loyalty, chatgpt
from .database import engine, Base, get_db, SessionLocal  # ← Thêm SessionLocal
from .services.cleanup_service import cleanup_inactive_users


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flashcard API")

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://bou-multilingual-flashcard-app.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api")
app.include_router(decks.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(dictionary.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(loyalty.router, prefix="/api")
app.include_router(chatgpt.router, prefix="/api")

# Setup APScheduler
scheduler = BackgroundScheduler()

# ← Wrapper function để truyền db session vào cleanup
def run_scheduled_cleanup():
    """Wrapper để chạy cleanup với database session"""
    db = SessionLocal()
    try:
        cleanup_inactive_users(db)
    finally:
        db.close()

# Chạy cleanup mỗi ngày lúc 3 giờ sáng
scheduler.add_job(
    run_scheduled_cleanup,  # ← Đổi từ cleanup_inactive_users
    CronTrigger(hour=3, minute=0),
    id="cleanup_inactive_users",
    name="Delete inactive users (30+ days)",
    replace_existing=True
)

@app.on_event("startup")
async def startup_event():
    """Khởi động scheduler khi app start"""
    scheduler.start()
    print("✅ Auto-cleanup scheduler started (runs daily at 3 AM)")

@app.on_event("shutdown")
async def shutdown_event():
    """Dừng scheduler khi app shutdown"""
    scheduler.shutdown()
    print("🛑 Scheduler stopped")

@app.get("/")
def root():
    return {"message": "Flashcard API is running"}

@app.get("/api/cleanup/stats")
def get_cleanup_statistics(db: Session = Depends(get_db)):
    """API để xem thống kê users sắp bị xóa"""
    from .services.cleanup_service import get_cleanup_stats
    return get_cleanup_stats(db)

@app.post("/api/cleanup/run")
def run_cleanup_manually(db: Session = Depends(get_db)):  # ← Thêm db dependency
    """API để chạy cleanup thủ công (cho testing)"""
    deleted_count = cleanup_inactive_users(db)  # ← Truyền db vào
    return {
        "message": "Cleanup completed",
        "deleted_users": deleted_count
    }
