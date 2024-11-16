from cryptography.fernet import Fernet
from ..config import settings

def get_encryption_key():
    # In production, use a proper key management service
    # For development, store this in your .env file
    return settings.ENCRYPTION_KEY

def encrypt_private_key(private_key: str) -> str:
    f = Fernet(get_encryption_key())
    return f.encrypt(private_key.encode()).decode()

def decrypt_private_key(encrypted_key: str) -> str:
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_key.encode()).decode()
