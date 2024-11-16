export async function getPlayerStats() {
  try {
    const response = await fetch('/api/player/stats');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return {
      totalGold: 0,
      huntsParticipated: 0,
      rewardsEarned: 0,
    };
  }
}

export async function getLeaderboardData() {
  try {
    const response = await fetch('/api/leaderboard');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return [];
  }
}

// Add more API utility functions as needed 