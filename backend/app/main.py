from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, wallet, game
from .database import engine, Base
from .models.user import User
from .models.wallet import Wallet
from .models.game import GameEntry

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(wallet.router, prefix="/wallet", tags=["wallet"])
app.include_router(game.router, prefix="/game", tags=["game"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Wonder Realm API"}