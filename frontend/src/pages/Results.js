import React from 'react';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import { useNavigate } from 'react-router-dom';

function Results() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center text-green-600">Game Results</h2>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Final Score</h3>
                <p className="text-4xl font-bold text-green-600">1,500</p>
                <p className="text-sm text-gray-500 mt-2">Personal Best: 2,300</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Rewards Earned</h3>
                <p className="text-4xl font-bold text-yellow-500">3 🪙</p>
                <p className="text-sm text-gray-500 mt-2">Total Collected: 27 Gold Tokens</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/game')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/dashboard')} 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-center text-blue-600">Leaderboard Highlights</h3>
            <Leaderboard />
          </div>
        </div>
      </div>
    </>
  );
}

export default Results;