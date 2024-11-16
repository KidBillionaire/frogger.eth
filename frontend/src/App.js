import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Results from './pages/Results';
import LeaderboardPage from './pages/LeaderboardPage';
import HowToPlay from './pages/HowToPlay';
import Tetris from './pages/Tetris';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game" element={<Game />} />
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/tetris" element={<Tetris />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;