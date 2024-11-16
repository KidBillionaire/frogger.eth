import React from 'react';
import Navbar from '../components/Navbar';
import TetrisGame from '../components/TetrisGame';

function Tetris() {
  return (
    <>
      <Navbar />
      <div className="w-full h-screen">
        <TetrisGame />
      </div>
    </>
  );
}

export default Tetris; 