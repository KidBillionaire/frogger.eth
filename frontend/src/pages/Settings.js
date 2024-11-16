import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useWallet } from '../hooks/useWallet';

function Settings() {
  const { walletAddress, disconnectWallet } = useWallet();
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Account Settings</h1>
        
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Wallet Connection</h2>
            {walletAddress ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-600">Connected Wallet Address</label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 p-3 rounded-lg text-sm flex-1 break-all">
                      {walletAddress}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {showCopied ? (
                        <span className="text-green-500">✓ Copied!</span>
                      ) : (
                        <span>📋</span>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <h3 className="font-medium text-gray-700">Disconnect Wallet</h3>
                    <p className="text-sm text-gray-500">This will remove your wallet connection</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-500">⚠️</span>
                  <div>
                    <p className="font-medium text-yellow-800">No Wallet Connected</p>
                    <p className="text-sm text-yellow-700">Connect your wallet to access all features</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Game Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Sound Effects</h3>
                  <p className="text-sm text-gray-500">Enable game sound effects</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;