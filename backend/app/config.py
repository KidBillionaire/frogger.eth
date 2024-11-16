from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ENCRYPTION_KEY: str

    BASE_RPC_URL: str = "https://sepolia.base.org"
    BASE_CHAIN_ID: int = 84532
    CONTRACT_ADDRESS: str = "your_contract_address"

    DEV_WALLET_ADDRESS: str
    TREASURY_WALLET_ADDRESS: str
    TREASURY_ENCRYPTED_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
