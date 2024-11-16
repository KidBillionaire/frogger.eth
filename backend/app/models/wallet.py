from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = {'schema': 'wonder-realm'}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('wonder-realm.users.id', ondelete='CASCADE'))
    encrypted_private_key = Column(String)
    
    user = relationship("User", back_populates="wallet")
