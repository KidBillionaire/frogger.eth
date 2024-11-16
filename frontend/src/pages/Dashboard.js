// src/pages/Dashboard.js
import React from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import Leaderboard from '../components/Leaderboard';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();

  const joinGame = () => {
    if (!walletAddress) {
      alert('Please connect your ETH wallet to play!');
      return;
    }
    navigate('/game');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-all">
                <StatsCard />
                <button
                  onClick={joinGame}
                  className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:translate-y-[-2px] transition-all focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 focus:outline-none"
                  aria-label="Start playing Frogger"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">🎮</span>
                    <span>Play Frogger</span>
                  </div>
                </button>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 p-6 rounded-2xl shadow-lg border border-yellow-100 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl" role="img" aria-label="warning">⚠️</span>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium leading-relaxed">
                    This is a skill-based game. Play responsibly and never bet more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="trophy">🏆</span>
                  Prize Pool Leaderboard
                </h2>
                <div className="overflow-hidden rounded-xl">
                  <Leaderboard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;