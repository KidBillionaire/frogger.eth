import React, { useState } from 'react';
import Navbar from '../components/Navbar';

function Landing() {
  const [jackpotAmount, setJackpotAmount] = useState(0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-8">Welcome to Crypto Crossing</h1>
          <p className="text-2xl mb-4">
            Current Jackpot: {jackpotAmount} ETH
          </p>
          <button
            className="px-8 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
            onClick={() => alert('Game starting soon!')}
          >
            Play Now
          </button>
        </div>
      </div>
    </>
  );
}

export default Landing;