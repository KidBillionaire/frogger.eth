import React from 'react';
import Navbar from '../components/Navbar';

function HowToPlay() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">How to Play & Win ETH</h2>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">
            Welcome to Frogger.eth! This is your chance to win big ETH rewards by showcasing your frog-hopping skills.
          </p>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">🎮 Game Mechanics</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Connect your ETH wallet to get started</li>
              <li>Place your bet in ETH to enter the game</li>
              <li>Guide your frog safely across roads and rivers</li>
              <li>Reach the lily pads at the end to win the jackpot!</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">💰 Prize Pool System</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>All player bets go into a smart contract jackpot pool</li>
              <li>Successfully reach the end to win the entire jackpot</li>
              <li>If you lose, your bet adds to the growing jackpot</li>
              <li>Track the current jackpot size on the Dashboard</li>
            </ul>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              Note: This is a skill-based game. Your success depends on your ability to navigate your frog safely. Play responsibly and never bet more than you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HowToPlay;