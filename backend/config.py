from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENCRYPTION_KEY: str
    DEV_WALLET_ADDRESS: str
    TREASURY_WALLET_ADDRESS: str
    TREASURY_ENCRYPTED_KEY: str

    class Config:
        env_file = ".env"

settings = Settings() 