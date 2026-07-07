from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.login import UserLogin
from app.utils.auth import verify_password, create_access_token
from app.utils.dependencies import get_current_user
# from app.database.models import user

from app.database.db import get_db
from app.database.models import User
from app.schemas.user import UserRegister
from app.utils.auth import hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {
            "sub": str(db_user.id),
            "email": db_user.email
        }
    )
    return {
        "access_token": token,
        "token_type": "bearer"
    }
# from fastapi import Depends
# from app.utils.dependencies import get_current_user
# from app.database.models import User

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }

  
