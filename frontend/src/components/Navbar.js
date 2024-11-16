import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

function Navbar() {
  const { walletAddress, connectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only navigate to tetris on Enter key
      if (e.key === 'Enter') {
        navigate('/tetris');
      }
    };

    const handleArrowKeys = (e) => {
      // Prevent arrow keys from scrolling the page
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleArrowKeys);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [navigate]);

  return (
    <nav className="bg-yellow-500">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <Link to="/" className="font-semibold text-xl tracking-tight">
            Pay-to-Hunt Gold Game
          </Link>
        </div>
        {/* Mobile Menu Button */}
        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="flex items-center px-3 py-2 border rounded text-yellow-200 border-yellow-400 hover:text-white hover:border-white"
          >
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <title>Menu</title>
              <path d="M0 3h20v2H0z M0 9h20v2H0z M0 15h20v2H0z" />
            </svg>
          </button>
        </div>
        {/* Navigation Links */}
        <div
          className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${
            isMenuOpen ? '' : 'hidden'
          }`}
        >
          <div className="text-sm lg:flex-grow">
            <Link
              to="/dashboard"
              className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-4"
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-4"
            >
              Leaderboard
            </Link>
            <Link
              to="/how-to-play"
              className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-4"
            >
              How to Play
            </Link>
            <Link
              to="/game"
              className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-4"
            >
              Game
            </Link>
            <Link
              to="/tetris"
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Play Tetris (Press Enter)
            </Link>
            <Link
              to="/settings"
              className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-4"
            >
              Settings
            </Link>
          </div>
          {/* Wallet Address Display */}
          <div>
            {walletAddress ? (
              <span className="inline-block mt-4 lg:mt-0 text-sm px-4 py-2 leading-none border rounded text-white border-white">
                Connected: {`${walletAddress.substring(0, 6)}...`}
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="inline-block mt-4 lg:mt-0 text-sm px-4 py-2 leading-none border rounded text-white border-white hover:bg-yellow-600"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;