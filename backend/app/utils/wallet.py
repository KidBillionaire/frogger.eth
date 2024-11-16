from eth_account import Account
import secrets

def create_wallet():
    # Generate a private key
    private_key = secrets.token_hex(32)
    account = Account.from_key(private_key)
    
    return {
        'address': account.address,
        'private_key': private_key
    }
