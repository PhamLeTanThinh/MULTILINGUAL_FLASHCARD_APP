import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# ================================
# ENV MODE: dev | prod
# ================================
# - dev  : chạy local, mặc định dùng SQLite
# - prod : chạy trên Railway, bắt buộc dùng Postgres
APP_ENV = os.getenv("APP_ENV", "dev").lower()

# ================================
# CHỌN DATABASE_URL
# ================================
if APP_ENV == "prod":
    # PROD: chỉ dùng Postgres (Railway)
    # Railway thường set:
    # - DATABASE_URL (internal: postgres.railway.internal)
    # - DATABASE_PUBLIC_URL (public: mainline.proxy.rlwy.net)
    DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL")

    if not DATABASE_URL or DATABASE_URL.strip() == "":
        raise RuntimeError(
            "❌ DATABASE_URL / DATABASE_PUBLIC_URL không được thiết lập (PROD).\n"
            "Hãy vào Railway → service backend → Variables và set DATABASE_URL hoặc DATABASE_PUBLIC_URL."
        )

    # Fix postgres:// → postgresql:// cho SQLAlchemy
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # Engine cho Postgres
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # tránh connection chết trên Railway
    )

else:
    # DEV: cho phép dùng SQLite cho tiện
    # Nếu bạn muốn dev cũng dùng Postgres thì set DATABASE_URL trong .env
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flashcard.db")

    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},  # cho SQLite local
        )
    else:
        # Trường hợp bạn dev mà muốn dùng Postgres local
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

        engine = create_engine(DATABASE_URL)

# ================================
# SESSION & BASE
# ================================
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency lấy session DB (dùng cho FastAPI)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def debug_print_db_config():
    """Optional: dùng để debug xem đang chạy DB gì (không bắt buộc gọi)."""
    print(f"[DB] APP_ENV     = {APP_ENV}")
    print(f"[DB] DATABASE_URL= {DATABASE_URL}")
