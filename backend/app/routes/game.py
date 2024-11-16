# game.py router

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from web3 import Web3
from decimal import Decimal

from ..config import settings
from ..utils.crypto import decrypt_private_key
from ..models import GameEntry, User, Wallet
from ..utils.auth import get_current_user
from ..database import get_db

router = APIRouter()

# Constants
ENTRY_FEE = Decimal('0.0021')        # Total entry fee
DEV_FEE = Decimal('0.0002')          # To dev wallet
PLAYER_INITIAL_BALANCE = Decimal('0.0017')  # Amount credited to player's game balance
TREASURY_FEE = ENTRY_FEE - DEV_FEE - PLAYER_INITIAL_BALANCE  # Remainder goes to treasury for rewards

@router.post("/entry", status_code=status.HTTP_201_CREATED)
async def pay_entry_fee(
   current_user: User = Depends(get_current_user),
   db: Session = Depends(get_db)
):
    """
    Process game entry fee payment:
    - Single transaction of 0.0021 ETH to treasury
    - Displayed to user as:
      - 0.0002 ETH dev fee
      - 0.0002 ETH treasury fee
      - 0.0017 ETH player balance
    """
    try:
        # Check if user already has an active game
        active_game = db.query(GameEntry).filter(
            GameEntry.user_id == current_user.id,
            GameEntry.status == 'active'
        ).first()
        
        if active_game:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active game"
            )

        w3 = Web3(Web3.HTTPProvider(settings.BASE_RPC_URL))
        
        # Get user's wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Wallet not found. Please create a wallet first."
            )

        # Debug connection and addresses
        print(f"Connected to network: {w3.is_connected()}")
        print(f"Chain ID: {w3.eth.chain_id}")
        print(f"User wallet: {current_user.wallet_address}")
        print(f"Treasury wallet: {settings.TREASURY_WALLET_ADDRESS}")

        # Validate wallet addresses
        if not all(w3.is_address(addr) for addr in [current_user.wallet_address, settings.TREASURY_WALLET_ADDRESS]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet address detected"
            )

        try:
            # Check if RPC is accessible
            block_number = w3.eth.get_block_number()
            print(f"Current block number: {block_number}")
        except Exception as e:
            print(f"RPC connection error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to connect to Base network. Please try again later."
            )

        try:
            # Get current gas price
            gas_price = w3.eth.gas_price
            print(f"Current gas price: {gas_price} wei")
            nonce = w3.eth.get_transaction_count(current_user.wallet_address)
            print(f"Current nonce: {nonce}")
        except Exception as e:
            print(f"Failed to get gas price or nonce: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get transaction details. Please try again."
            )

        # Prepare single transaction to treasury
        treasury_tx = {
            'from': current_user.wallet_address,
            'to': settings.TREASURY_WALLET_ADDRESS,
            'value': w3.to_wei(ENTRY_FEE, 'ether'),  # Full amount goes to treasury
            'chainId': settings.BASE_CHAIN_ID,
            'nonce': nonce,
            'gasPrice': gas_price,
            'gas': 21000  # Standard ETH transfer gas limit
        }

        print(f"Treasury transaction for estimation: {treasury_tx}")

        try:
            # Estimate gas for single transaction
            estimated_gas = w3.eth.estimate_gas(treasury_tx)
            print(f"Estimated gas: {estimated_gas}")
            
            gas_cost = w3.from_wei(estimated_gas * gas_price, 'ether')
            print(f"Gas cost: {gas_cost} ETH")
            
        except Exception as e:
            print(f"Gas estimation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to estimate gas fees: {str(e)}"
            )

        # Check if user has enough balance for entry fee + gas
        try:
            total_needed = ENTRY_FEE + Decimal(str(gas_cost))
            balance = w3.eth.get_balance(current_user.wallet_address)
            balance_in_eth = Decimal(str(w3.from_wei(balance, 'ether')))
            
            print(f"User balance: {balance_in_eth} ETH")
            print(f"Total needed: {total_needed} ETH")
            
        except Exception as e:
            print(f"Balance check error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to check wallet balance. Please try again."
            )
        
        if balance_in_eth < total_needed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. You need {total_needed:.6f} ETH (includes {gas_cost:.6f} ETH for gas)"
            )

        # Get user's private key
        try:
            private_key = decrypt_private_key(wallet.encrypted_private_key)
        except Exception as e:
            print(f"Decryption error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to decrypt wallet. Please contact support."
            )

        try:
            # Update gas value in transaction
            treasury_tx['gas'] = estimated_gas
            
            # Sign and send transaction
            signed_tx = w3.eth.account.sign_transaction(treasury_tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            print(f"Transaction hash: {w3.to_hex(tx_hash)}")
            
        except Exception as e:
            error_message = str(e).lower()
            print(f"Transaction error: {error_message}")
            
            if "nonce too low" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Transaction failed: Nonce too low. Please try again."
                )
            elif "insufficient funds" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient balance. You need {total_needed:.6f} ETH (includes {gas_cost:.6f} ETH for gas)"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process transaction: {str(e)}"
                )

        try:
            # Create game entry record
            new_game_entry = GameEntry(
                user_id=current_user.id,
                entry_fee_amount=ENTRY_FEE,
                transaction_hash=w3.to_hex(tx_hash),
                status='active',
                balance=PLAYER_INITIAL_BALANCE
            )
            
            db.add(new_game_entry)
            db.commit()
        except Exception as e:
            print(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create game entry. Please contact support."
            )
        
        return {
            "message": "Entry fee paid successfully",
            "transaction_hash": w3.to_hex(tx_hash),
            "game_entry_id": new_game_entry.id,
            "initial_balance": float(PLAYER_INITIAL_BALANCE),
            "total_paid": float(total_needed),
            "gas_cost": float(gas_cost)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again or contact support."
        )


@router.get("/status", response_model=dict)
async def check_game_status(
   current_user: User = Depends(get_current_user),
   db: Session = Depends(get_db)
):
   """
   Check if user has an active game and return appropriate status.
   Returns:
   - If in game: Entry details and balance
   - If not in game: Entry fee information
   """
   active_game = db.query(GameEntry).filter(
       GameEntry.user_id == current_user.id,
       GameEntry.status == 'active'
   ).first()
   
   if active_game:
       return {
           "is_in_game": True,
           "game_entry_id": active_game.id,
           "entry_timestamp": active_game.entry_timestamp,
           "balance": float(active_game.balance),
           "status": active_game.status
       }
   
   return {
       "is_in_game": False,
       "entry_fee": float(ENTRY_FEE),
       "message": "Entry fee required to play"
   }
