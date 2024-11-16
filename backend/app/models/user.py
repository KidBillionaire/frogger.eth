from sqlalchemy import Boolean, Column, Integer, String
from ..database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'wonder-realm'}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    wallet_address = Column(String, unique=True)
    is_active = Column(Boolean, default=True)

    wallet = relationship("Wallet", back_populates="user", uselist=False)
    game_entries = relationship("GameEntry", back_populates="user")
