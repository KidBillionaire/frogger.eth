from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class GameEntry(Base):
    __tablename__ = "game_entries"
    __table_args__ = {'schema': 'wonder-realm'}

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("wonder-realm.users.id"), nullable=False)
    entry_fee_amount = Column(DECIMAL(20, 18), nullable=False)
    entry_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    transaction_hash = Column(String(66), nullable=False)
    status = Column(String(20), nullable=False)
    balance = Column(DECIMAL(20, 18), nullable=False, server_default='0')
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="game_entries")
