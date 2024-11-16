import { useState, useEffect, useMemo } from 'react';
import { ClipboardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isBuyOpen, setIsBuyOpen] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!profile?.wallet_address) return;

      try {
        const response = await fetch(
          `http://localhost:8000/wallet/balance/${profile.wallet_address}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance');
        }

        const data = await response.json();
        setWalletBalance(data.balance);
      } catch (err) {
        console.error('Error fetching balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };

    if (profile) {
      fetchBalance();
    }
  }, [profile]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profile.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const refreshBalance = async () => {
    if (!profile?.wallet_address) return;
    setBalanceLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/wallet/balance/${profile.wallet_address}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
  
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Modal Components
  const DepositModal = () => (
    <Transition appear show={isDepositOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsDepositOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  Deposit ETH
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Warning Message */}
                  <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-200">
                      Make sure to send ETH on the Base chain only. Sending from other chains may result in permanent loss of funds.
                    </p>
                  </div>

                  {/* Address Input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={profile?.wallet_address}
                      className="flex-1 bg-gray-900 text-sm font-mono p-2 rounded border border-gray-700 focus:outline-none text-gray-300"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  const WithdrawModal = ({ isWithdrawOpen = false, setIsWithdrawOpen }) => {
    const [amount, setAmount] = useState('');
    const [localWithdrawAddress, setLocalWithdrawAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [gasEstimate, setGasEstimate] = useState(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [successData, setSuccessData] = useState(null);
  
    // Fetch user's balance
    useEffect(() => {
      const fetchBalance = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/wallet/balance/${profile?.wallet_address}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setUserBalance(parseFloat(data.balance));
          }
        } catch (err) {
          console.error('Failed to fetch balance:', err);
        }
      };
  
      if (profile?.wallet_address) {
        fetchBalance();
      }
    }, [profile?.wallet_address]);
  
    // Gas estimation effect
    useEffect(() => {
      const estimateGas = async () => {
        if (!amount || !localWithdrawAddress || amount <= 0) {
          setGasEstimate(null);
          return;
        }
  
        setIsEstimating(true);
        try {
          const response = await fetch(
            `http://localhost:8000/wallet/estimate-gas?recipient_address=${localWithdrawAddress}&amount=${amount}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
  
          if (!response.ok) {
            throw new Error('Failed to estimate gas');
          }
  
          const data = await response.json();
          setGasEstimate(data);
        } catch (err) {
          console.error('Gas estimation failed:', err);
          setWithdrawError('Failed to estimate gas fees');
        } finally {
          setIsEstimating(false);
        }
      };
  
      const timeoutId = setTimeout(estimateGas, 500);
      return () => clearTimeout(timeoutId);
    }, [amount, localWithdrawAddress]);
  
    // Check if user has enough balance
    const hasInsufficientBalance = useMemo(() => {
      if (!gasEstimate || !amount) return false;
      const totalNeeded = parseFloat(amount) + gasEstimate.gas_fee_eth;
      return totalNeeded > userBalance;
    }, [gasEstimate, amount, userBalance]);
  
    const handleWithdraw = async () => {
      setWithdrawError('');
      setIsSubmitting(true);
  
      try {
        const response = await fetch('http://localhost:8000/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            recipient_address: localWithdrawAddress,
            amount: parseFloat(amount)
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Withdrawal failed');
        }
  
        const data = await response.json();
        setSuccessData(data);
        
      } catch (err) {
        console.error('Withdrawal error:', err);
        setWithdrawError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleClose = () => {
      if (successData) {
        refreshBalance();
      }
      setIsWithdrawOpen(false);
      setSuccessData(null);
    };
  
    return (
      <Dialog 
        as="div" 
        className="relative z-10" 
        onClose={handleClose}
        open={isWithdrawOpen}
      >
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
    
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              {successData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-500" />
                  </div>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white text-center mb-4">
                    Withdrawal Successful
                  </Dialog.Title>
                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">{successData.amount} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Recipient:</span>
                        <span className="text-white font-mono text-xs break-all">{successData.recipient}</span>
                      </div>
                      <div className="border-t border-gray-700 my-2" />
                      <div>
                        <span className="text-gray-400 text-sm block mb-1">Transaction Hash:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-white bg-gray-700 p-2 rounded font-mono break-all flex-1">
                            {successData.tx_hash}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(successData.tx_hash)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                            title="Copy to clipboard"
                          >
                            <ClipboardIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                    Withdraw ETH
                  </Dialog.Title>
    
                  <div className="space-y-4">
                    {/* Warning Message */}
                    <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-200">
                        Make sure the receiving address is correct and accepts ETH on Base chain. 
                        Withdrawals cannot be reversed.
                      </p>
                    </div>
    
                    {/* Address Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={localWithdrawAddress}
                        onChange={(e) => setLocalWithdrawAddress(e.target.value)}
                        className="w-full bg-gray-900 text-sm font-mono p-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 text-gray-300"
                        placeholder="0x..."
                      />
                    </div>
    
                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-900 text-sm p-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 text-gray-300"
                        placeholder="0.0"
                        step="0.0001"
                        min="0"
                      />
                    </div>
    
                    {/* Gas Estimation */}
                    {isEstimating ? (
                      <div className="text-sm text-gray-400">
                        Estimating gas fees...
                      </div>
                    ) : gasEstimate && (
                      <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white">{Number(amount).toFixed(8)} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Estimated Gas Fee:</span>
                          <span className="text-white">{Number(gasEstimate.gas_fee_eth).toFixed(8)} ETH</span>
                        </div>
                        <div className="border-t border-gray-700 my-2" />
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white">{Number(gasEstimate.total_amount_eth).toFixed(8)} ETH</span>
                        </div>
    
                        {/* Debug Info */}
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Gas Price:</span>
                              <span>{gasEstimate.debug_info.gas_price_gwei} Gwei</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gas Limit:</span>
                              <span>{gasEstimate.debug_info.gas_limit} units</span>
                            </div>
                          </div>
                        </div>
    
                        {/* Insufficient Balance Warning */}
                        {hasInsufficientBalance && (
                          <div className="mt-2 text-red-400 text-sm flex items-center space-x-1">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Insufficient balance for withdrawal + gas fee</span>
                          </div>
                        )}
                      </div>
                    )}
    
                    {withdrawError && (
                      <div className="text-red-400 text-sm">
                        {withdrawError}
                      </div>
                    )}
    
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                      onClick={handleWithdraw}
                      disabled={
                        isSubmitting || 
                        !amount || 
                        !localWithdrawAddress || 
                        !gasEstimate || 
                        isEstimating || 
                        hasInsufficientBalance
                      }
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  };

  const BuyModal = () => (
    <Transition appear show={isBuyOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsBuyOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  Buy ETH
                </Dialog.Title>

                <div className="text-center py-8">
                  <p className="text-gray-300">Coming Soon!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Direct purchase of ETH will be available in a future update.
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Static Navigation Bar */}
      <nav className="bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title with navigation */}
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors duration-200"
            >
              Wonder Realm
            </button>

            {/* Profile Button (now clickable) */}
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400">Username</label>
              <div className="mt-1 text-lg">{profile.username}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <div className="mt-1 text-lg">{profile.email}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400">Wallet</label>
              <div className="mt-1 p-4 bg-gray-900 rounded-lg space-y-4">
                {/* Balance */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Balance:</span>
                  {balanceLoading ? (
                    <div className="text-sm">Loading...</div>
                  ) : (
                    <div className="text-lg font-medium">
                      {walletBalance} ETH on Base
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setIsBuyOpen(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal />
      <WithdrawModal 
        isWithdrawOpen={isWithdrawOpen} 
        setIsWithdrawOpen={setIsWithdrawOpen} 
        profile={profile}
        refreshBalance={refreshBalance}
      />
      <BuyModal />
    </div>
  );
}

export default Profile;