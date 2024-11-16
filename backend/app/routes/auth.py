from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas.user import User, UserCreate, UserLogin, Token
from app.models.user import User as UserModel
from app.utils.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.config import settings
from eth_account import Account
import secrets
from app.utils.crypto import encrypt_private_key
from app.models.wallet import Wallet

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post("/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check existing email
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Check existing username
        db_username = db.query(UserModel).filter(UserModel.username == user.username).first()
        if db_username:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Create wallet
        private_key = secrets.token_hex(32)
        account = Account.from_key(private_key)
        wallet_address = account.address

        # Create user with wallet
        hashed_password = get_password_hash(user.password)
        db_user = UserModel(
            email=user.email, 
            username=user.username, 
            hashed_password=hashed_password,
            wallet_address=wallet_address
        )

        db.add(db_user)
        db.flush()

        # Create wallet record
        wallet = Wallet(
            user_id=db_user.id,
            encrypted_private_key=encrypt_private_key(private_key)
        )
        db.add(wallet)
        
        db.commit()
        db.refresh(db_user)
        
        return db_user

    except Exception as e:
        db.rollback()
        # Add this print statement to see the error
        print(f"Error in register: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Could not create user account: {str(e)}"
        )


@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def get_profile(current_user: UserModel = Depends(get_current_user)):
    return current_user
