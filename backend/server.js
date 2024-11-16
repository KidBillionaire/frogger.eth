const io = require('socket.io')(3000, {
  cors: {
    origin: '*',
  },
});

let leaderboard = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Initialize player's score
  let playerScore = 0;

  // Handle score updates
  socket.on('scoreUpdate', (score) => {
    playerScore = score;
    updateLeaderboard(socket.id, playerScore);
    emitLeaderboard();
  });

  // Handle game over
  socket.on('gameOver', (finalScore) => {
    playerScore = finalScore;
    updateLeaderboard(socket.id, playerScore);
    emitLeaderboard();
    // Optionally handle end of game logic
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    leaderboard = leaderboard.filter((entry) => entry.id !== socket.id);
    emitLeaderboard();
    console.log('A user disconnected');
  });

  function updateLeaderboard(id, score) {
    const existingPlayer = leaderboard.find((entry) => entry.id === id);
    if (existingPlayer) {
      existingPlayer.score = score;
    } else {
      leaderboard.push({ id, name: `Player ${id.substring(0, 5)}`, score });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 3); // Keep top 3 players
  }

  function emitLeaderboard() {
    io.emit('leaderboardUpdate', leaderboard);
  }
}); 