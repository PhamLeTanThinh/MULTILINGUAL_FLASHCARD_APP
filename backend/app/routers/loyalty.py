from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, crud

router = APIRouter(prefix="/loyalty", tags=["loyalty"])

# ====== CONFIG: SHOP ITEMS ======
# Key: avatar code, Value: cost (bPoint)
AVATAR_SHOP = {
    "default": 0,
    "cat": 30,
    "panda": 30,
    "dragon": 30,
    "fox": 30,
    "robot": 30,
    "unicorn": 30,
    "alien": 30,
    "ghost": 30,
}

# Key: theme code, Value: cost (bPoint)
THEME_SHOP = {
    "default": 0,
    "sakura": 30,
    "forest": 30,
    "sunset": 30,
    "ocean": 30,
    "neon": 30,
}

CUSTOM_THEME_COST = 100  # cost cho 1 custom theme


def get_or_init_user(db: Session, user_id: int) -> models.User:
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Đảm bảo có default
    if getattr(user, "points", None) is None:
        user.points = 0
    if not getattr(user, "theme", None):
        user.theme = "default"
    if not getattr(user, "avatar", None):
        user.avatar = "default"

    db.commit()
    db.refresh(user)
    return user


def build_loyalty_response(user: models.User):
    return {
        "user_id": user.id,
        "points": user.points or 0,
        "avatar": user.avatar or "default",
        "theme": user.theme or "default",
        "available_avatars": AVATAR_SHOP,
        "available_themes": THEME_SHOP,
    }


# ====== GET LOYALTY STATE ======
@router.get("/users/{user_id}")
def get_user_loyalty(user_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin loyalty cho 1 user:
    - points hiện tại
    - avatar đang dùng
    - theme đang dùng
    - danh sách shop (avatars + themes + cost)
    """
    user = get_or_init_user(db, user_id)
    return build_loyalty_response(user)


# ====== REDEEM AVATAR ======
@router.post("/redeem/avatar")
def redeem_avatar(payload: dict, db: Session = Depends(get_db)):
    """
    Body:
    {
      "user_id": int,
      "avatar": "cat" | "panda" | ...
    }
    """
    user_id = payload.get("user_id")
    avatar_key = payload.get("avatar")

    if user_id is None or avatar_key is None:
        raise HTTPException(status_code=400, detail="user_id and avatar are required")

    if avatar_key not in AVATAR_SHOP:
        raise HTTPException(status_code=400, detail="Invalid avatar option")

    user = get_or_init_user(db, user_id)
    cost = AVATAR_SHOP[avatar_key]

    if cost > 0 and (user.points or 0) < cost:
        raise HTTPException(status_code=400, detail="Not enough points")

    # Trừ điểm & set avatar
    user.points = (user.points or 0) - cost
    user.avatar = avatar_key
    db.commit()
    db.refresh(user)

    return build_loyalty_response(user)


# ====== REDEEM THEME (fixed theme) ======
@router.post("/redeem/theme")
def redeem_theme(payload: dict, db: Session = Depends(get_db)):
    """
    Body:
    {
      "user_id": int,
      "theme": "sakura" | "dark" | ...
    }
    """
    user_id = payload.get("user_id")
    theme_key = payload.get("theme")

    if user_id is None or theme_key is None:
        raise HTTPException(status_code=400, detail="user_id and theme are required")

    if theme_key not in THEME_SHOP:
        raise HTTPException(status_code=400, detail="Invalid theme option")

    user = get_or_init_user(db, user_id)
    cost = THEME_SHOP[theme_key]

    if cost > 0 and (user.points or 0) < cost:
        raise HTTPException(status_code=400, detail="Not enough points")

    # Trừ điểm & set theme
    user.points = (user.points or 0) - cost
    user.theme = theme_key
    db.commit()
    db.refresh(user)

    return build_loyalty_response(user)


# ====== REDEEM CUSTOM THEME (color picker) ======
@router.post("/redeem/custom-theme")
def redeem_custom_theme(payload: dict, db: Session = Depends(get_db)):
    """
    Body:
    {
      "user_id": int,
      "from_color": "#rrggbb",
      "via_color": "#rrggbb",
      "to_color": "#rrggbb",
      "cost": 30 (optional)
    }
    -> Lưu theme dạng: custom:#ff9a9e,#fad0c4,#fbc2eb
    """
    user_id = payload.get("user_id")
    from_color = payload.get("from_color") or "#4f46e5"
    via_color = payload.get("via_color") or from_color
    to_color = payload.get("to_color") or via_color
    cost = int(payload.get("cost") or CUSTOM_THEME_COST)

    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id is required")

    user = get_or_init_user(db, user_id)

    if cost > 0 and (user.points or 0) < cost:
        raise HTTPException(status_code=400, detail="Not enough points")

    # OPTIONAL: validate basic hex
    def normalize_hex(c: str) -> str:
        c = c.strip()
        if not c.startswith("#"):
            c = "#" + c
        if len(c) != 7:
            return "#4f46e5"
        return c

    from_color = normalize_hex(from_color)
    via_color = normalize_hex(via_color)
    to_color = normalize_hex(to_color)

    # Trừ điểm & set custom theme
    user.points = (user.points or 0) - cost
    user.theme = f"custom:{from_color},{via_color},{to_color}"
    db.commit()
    db.refresh(user)

    return build_loyalty_response(user)

@router.post("/redeem/custom-avatar")
def redeem_custom_avatar(payload: dict, db: Session = Depends(get_db)):
    """
    Body:
    {
      "user_id": int,
      "emoji": "🥷",
      "cost": 100  (optional)
    }
    -> Lưu avatar = emoji thẳng luôn (không cần nằm trong AVATAR_SHOP)
    """
    user_id = payload.get("user_id")
    emoji = payload.get("emoji")
    cost = int(payload.get("cost") or 100)

    if user_id is None or not emoji:
        raise HTTPException(status_code=400, detail="user_id and emoji are required")

    user = get_or_init_user(db, user_id)

    if cost > 0 and (user.points or 0) < cost:
        raise HTTPException(status_code=400, detail="Not enough points")

    user.points = (user.points or 0) - cost
    user.avatar = emoji  # lưu raw emoji
    db.commit()
    db.refresh(user)

    return build_loyalty_response(user)
