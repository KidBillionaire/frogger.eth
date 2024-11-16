import { useState, useEffect } from 'react';

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // Check if wallet is already connected
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);

        // Optionally, add event listener for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setWalletAddress(accounts[0] || null);
        });
      } catch (error) {
        console.error('User rejected the request.', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
  };

  return {
    walletAddress,
    connectWallet,
    disconnectWallet,
  };
} 