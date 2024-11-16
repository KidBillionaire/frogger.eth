import React from 'react';
import Navbar from '../components/Navbar';
import GameMap from '../components/GameMap';

function Game() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      <Navbar />
      <div className="w-full h-screen">
        <GameMap />
      </div>
    </div>
  );
}

export default Game;