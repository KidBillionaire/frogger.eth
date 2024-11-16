import React from 'react';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';

function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 mb-2 animate-pulse">
            Whale Watch 🐋
          </h1>
          <p className="text-gray-300 text-xl">Top ETH Hunters Leading The Pack</p>
        </div>
        
        <div className="backdrop-blur-sm bg-white/10 rounded-xl shadow-2xl p-6 border border-white/20">
          <div className="animate-glow">
            <Leaderboard />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 italic">
            "Fortune favors the bold. Get back in the game and claim your spot!" 
          </p>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;