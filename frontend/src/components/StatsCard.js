import React, { useEffect, useState } from 'react';
import { getPlayerStats } from '../utils/api';

function StatsCard() {
  const [stats, setStats] = useState({
    totalGold: 0,
    huntsParticipated: 0,
    rewardsEarned: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const data = await getPlayerStats(); // Fetch player stats from API
      setStats(data);
    }
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Your Stats</h3>
      <ul className="space-y-2">
        <li>Total Gold Collected: <span className="font-semibold">{stats.totalGold}</span></li>
        <li>Hunts Participated: <span className="font-semibold">{stats.huntsParticipated}</span></li>
        <li>Rewards Earned: <span className="font-semibold">{stats.rewardsEarned}</span></li>
      </ul>
    </div>
  );
}

export default StatsCard; 