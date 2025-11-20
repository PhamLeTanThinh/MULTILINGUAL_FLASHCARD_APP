from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# =====================================
# CHỈ DÙNG POSTGRES TRÊN RAILWAY
# =====================================

# Railway thường set:
# - DATABASE_URL           (internal: postgres.railway.internal)
# - DATABASE_PUBLIC_URL    (public: mainline.proxy.rlwy.net)
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL")

if not DATABASE_URL or DATABASE_URL.strip() == "":
    # Không fallback sqlite nữa – bắt buộc phải cấu hình Postgres
    raise RuntimeError(
        "❌ DATABASE_URL không được thiết lập. "
        "Hãy vào Railway → service backend → Variables và set DATABASE_URL hoặc DATABASE_PUBLIC_URL."
    )

# Fix trường hợp URL dạng postgres:// → postgresql:// cho SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Tạo engine cho PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # tự ping connection, tránh timeout trên Railway
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency lấy session DB (dùng cho FastAPI / Flask)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
