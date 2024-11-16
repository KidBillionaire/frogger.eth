import React, { useEffect, useState } from 'react';
import { getLeaderboardData } from '../utils/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getLeaderboardData();
      setLeaderboard(data);
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow overflow-x-auto">
      <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Player</th>
            <th className="px-4 py-2 text-left">Gold Collected</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{player.name}</td>
              <td className="px-4 py-2">{player.goldCollected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard; 