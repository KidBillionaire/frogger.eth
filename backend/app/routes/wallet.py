from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from web3 import Web3
from typing import Dict
from pydantic import BaseModel

from ..database import get_db
from ..models.user import User
from ..models.wallet import Wallet
from ..utils.auth import get_current_user
from ..utils.crypto import decrypt_private_key
from ..config import settings

router = APIRouter()


@router.get("/balance/{address}", tags=["wallet"])
async def get_wallet_balance(
    address: str, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    # Verify this wallet belongs to the requesting user
    if current_user.wallet_address != address:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to view this wallet"
        )
    
    try:
        w3 = Web3(Web3.HTTPProvider(settings.BASE_RPC_URL))
        balance = w3.eth.get_balance(address)
        # Convert from Wei to ETH
        balance_in_eth = w3.from_wei(balance, 'ether')
        
        return {
            "balance": str(balance_in_eth),
            "address": address
        }
    except Exception as e:
        print(f"Error fetching balance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch wallet balance: {str(e)}"
        )


@router.get("/estimate-gas")
async def estimate_gas_fee(
    recipient_address: str = Query(...),
    amount: float = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not Web3.is_address(recipient_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum address"
        )

    try:
        w3 = Web3(Web3.HTTPProvider(settings.BASE_RPC_URL))
        
        # Debug connection
        print(f"Connected to network: {w3.is_connected()}")
        print(f"Chain ID: {w3.eth.chain_id}")
        print(f"Gas price: {w3.eth.gas_price}")
        print(f"Current user wallet: {current_user.wallet_address}")
        print(f"Recipient address: {recipient_address}")
        print(f"Amount: {amount} ETH")
        
        # Create transaction for estimation
        transaction = {
            'from': current_user.wallet_address,
            'to': recipient_address,
            'value': w3.to_wei(amount, 'ether'),
            'chainId': settings.BASE_CHAIN_ID,
            # Add these fields for more accurate estimation
            'nonce': w3.eth.get_transaction_count(current_user.wallet_address),
            'gasPrice': w3.eth.gas_price,
            'gas': 21000  # Standard ETH transfer gas limit
        }

        try:
            # Print debug info
            print(f"Transaction for estimation: {transaction}")
            
            # Get gas price first
            gas_price = w3.eth.gas_price
            print(f"Current gas price: {gas_price}")
            
            # Use default gas limit for ETH transfers if estimation fails
            try:
                gas_estimate = w3.eth.estimate_gas(transaction)
                print(f"Estimated gas: {gas_estimate}")
            except Exception as gas_err:
                print(f"Gas estimation failed: {str(gas_err)}, using default")
                gas_estimate = 21000  # Standard ETH transfer

            # Calculate total gas fee in ETH
            gas_fee_wei = gas_estimate * gas_price
            gas_fee_eth = w3.from_wei(gas_fee_wei, 'ether')
            
            print(f"Gas fee in ETH: {gas_fee_eth}")
            print(f"Gas fee in Wei: {gas_fee_wei}")
            print(f"Gas price in Gwei: {w3.from_wei(gas_price, 'gwei')}")

            return {
                "gas_estimate": gas_estimate,
                "gas_price": gas_price,
                "gas_fee_eth": float(gas_fee_eth),
                "total_amount_eth": float(gas_fee_eth) + float(amount),
                "debug_info": {
                    "gas_price_gwei": float(w3.from_wei(gas_price, 'gwei')),
                    "gas_limit": int(gas_estimate),
                    "gas_fee_wei": str(gas_fee_wei),
                    "chain_id": w3.eth.chain_id,
                    "is_connected": w3.is_connected()
                }
            }

        except Exception as inner_e:
            print(f"Inner estimation error: {str(inner_e)}")
            raise

    except Exception as e:
        print(f"Gas estimation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gas estimation failed: {str(e)}"
        )


# Pydantic model for withdrawal request
class WithdrawRequest(BaseModel):
    recipient_address: str
    amount: float

@router.post("/withdraw")
async def withdraw_eth(
    withdraw_data: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Received withdrawal request: {withdraw_data}")
    
    if not Web3.is_address(withdraw_data.recipient_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Ethereum address"
        )

    w3 = Web3(Web3.HTTPProvider(settings.BASE_RPC_URL))
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    balance = w3.eth.get_balance(current_user.wallet_address)
    balance_in_eth = w3.from_wei(balance, 'ether')
    if balance_in_eth < withdraw_data.amount:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient balance"
        )

    try:
        private_key = decrypt_private_key(wallet.encrypted_private_key)
        nonce = w3.eth.get_transaction_count(current_user.wallet_address)
        gas_price = w3.eth.gas_price

        print(f"Preparing transaction:")
        print(f"From: {current_user.wallet_address}")
        print(f"To: {withdraw_data.recipient_address}")
        print(f"Amount: {withdraw_data.amount} ETH")
        print(f"Nonce: {nonce}")
        print(f"Gas Price: {gas_price}")

        transaction = {
            'nonce': nonce,
            'gasPrice': gas_price,
            'gas': 21000,
            'to': withdraw_data.recipient_address,
            'value': w3.to_wei(withdraw_data.amount, 'ether'),
            'chainId': settings.BASE_CHAIN_ID,
            'from': current_user.wallet_address
        }

        # Estimate gas
        try:
            estimated_gas = w3.eth.estimate_gas(transaction)
            transaction['gas'] = estimated_gas
        except Exception as gas_error:
            print(f"Gas estimation failed: {str(gas_error)}, using default")
            transaction['gas'] = 21000

        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(
            transaction_dict=transaction,
            private_key=private_key
        )
        
        # Use raw_transaction (with underscore)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_hash_hex = w3.to_hex(tx_hash)
        
        print(f"Transaction hash: {tx_hash_hex}")
        
        return {
            "message": "Withdrawal initiated",
            "tx_hash": tx_hash_hex,
            "amount": withdraw_data.amount,
            "recipient": withdraw_data.recipient_address
        }

    except Exception as e:
        print(f"Withdrawal error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Withdrawal failed: {str(e)}"
        )

class EntryFeePayment(BaseModel):
    amount: float = 0.1  # Fixed entry fee

@router.post("/game/pay-entry")
async def pay_entry_fee(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user already has an active game
    active_game = db.query(GameEntry).filter(
        GameEntry.user_id == current_user.id,
        GameEntry.status == 'active'
    ).first()
    
    if active_game:
        raise HTTPException(
            status_code=400,
            detail="User already has an active game"
        )

    ENTRY_FEE = 0.1  # ETH
    GAME_WALLET_ADDRESS = settings.GAME_WALLET_ADDRESS  # Treasury wallet that collects entry fees

    w3 = Web3(Web3.HTTPProvider(settings.BASE_RPC_URL))
    
    # Get user's wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Check balance
    balance = w3.eth.get_balance(current_user.wallet_address)
    balance_in_eth = w3.from_wei(balance, 'ether')
    if balance_in_eth < ENTRY_FEE:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient balance for entry fee"
        )

    try:
        private_key = decrypt_private_key(wallet.encrypted_private_key)
        nonce = w3.eth.get_transaction_count(current_user.wallet_address)
        gas_price = w3.eth.gas_price

        transaction = {
            'nonce': nonce,
            'gasPrice': gas_price,
            'gas': 21000,
            'to': GAME_WALLET_ADDRESS,
            'value': w3.to_wei(ENTRY_FEE, 'ether'),
            'chainId': settings.BASE_CHAIN_ID,
            'from': current_user.wallet_address
        }

        # Estimate gas
        try:
            estimated_gas = w3.eth.estimate_gas(transaction)
            transaction['gas'] = estimated_gas
        except Exception as gas_error:
            print(f"Gas estimation failed: {str(gas_error)}, using default")
            transaction['gas'] = 21000

        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(
            transaction_dict=transaction,
            private_key=private_key
        )
        
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_hash_hex = w3.to_hex(tx_hash)
        
        # Create game entry record
        new_game_entry = GameEntry(
            user_id=current_user.id,
            entry_fee_amount=ENTRY_FEE,
            transaction_hash=tx_hash_hex,
            status='active'
        )
        
        db.add(new_game_entry)
        db.commit()
        
        return {
            "message": "Entry fee paid successfully",
            "tx_hash": tx_hash_hex,
            "game_entry_id": new_game_entry.id,
            "amount": ENTRY_FEE
        }

    except Exception as e:
        print(f"Entry fee payment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Entry fee payment failed: {str(e)}"
        )
