import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { io } from 'socket.io-client';

function GameMap() {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:3000');

    const config = {
      type: Phaser.AUTO,
      parent: gameContainer.current,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    gameInstance.current = new Phaser.Game(config);

    let player;
    let cursors;
    let cars;
    let logs;
    let score = 0; // Start with 0 ETH
    let scoreText;
    let timerText;
    let timerEvent;
    let timeRemaining = 300;
    let leaderboardText;
    let water;
    let safeZones;
    let instructionsText;
    let missedText;
    let grass;
    let road;
    let currentRound = 1;
    let currentReward = 0.5; // Starting reward is 0.5 ETH

    function preload() {
      this.load.image('player', '/assets/player.png');
      this.load.image('car', '/assets/car.png');
      this.load.image('log', '/assets/log.png');
      this.load.image('water', '/assets/water.png');
      this.load.image('grass', '/assets/grass.png');
      this.load.image('road', '/assets/road.png');
    }

    function create() {
      // Create layered background like classic Frogger
      // Bottom grass area
      this.add.tileSprite(0, window.innerHeight - window.innerHeight/6, window.innerWidth, window.innerHeight/6, 'grass')
        .setOrigin(0, 0)
        .setScrollFactor(0);

      // Road area
      road = this.add.tileSprite(0, window.innerHeight * 0.5, window.innerWidth, window.innerHeight/3, 'road')
        .setOrigin(0, 0)
        .setScrollFactor(0);

      // Water area
      water = this.physics.add.staticGroup();
      const waterBackground = this.add.tileSprite(0, window.innerHeight * 0.15, window.innerWidth, window.innerHeight/3, 'water')
        .setOrigin(0, 0)
        .setScrollFactor(0);
      
      // Top grass finish area
      this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight/8, 'grass')
        .setOrigin(0, 0)
        .setScrollFactor(0);

      // Add collision zones for water
      for (let i = 1; i < 4; i++) {
        const waterZone = water.create(window.innerWidth/2, window.innerHeight * (i/5), 'water')
          .setDisplaySize(window.innerWidth, window.innerHeight/6)
          .setAlpha(0); // Make collision zones invisible
      }

      // Create player with glow effect
      player = this.physics.add.sprite(window.innerWidth/2, window.innerHeight-50, 'player');
      player.setCollideWorldBounds(true);
      player.preFX.addGlow(0xffd700, 4);
      player.setScale(0.5);

      // Create cars
      cars = this.physics.add.group();
      for (let i = 0; i < 8; i++) {
        const y = window.innerHeight * (0.6 + (i % 2) * 0.15);
        const speed = (i % 2 ? -200 : 200);
        const car = cars.create(-100, y, 'car');
        car.setVelocityX(speed);
        car.preFX.addGlow(0xff0000, 4);
        car.setScale(0.7);
      }

      // Create logs
      logs = this.physics.add.group();
      for (let i = 0; i < 6; i++) {
        const y = window.innerHeight * (0.2 + (i % 3) * 0.15);
        const speed = (i % 2 ? -100 : 100);
        const log = logs.create(-200, y, 'log');
        log.setVelocityX(speed);
        log.preFX.addGlow(0x8b4513, 4);
        log.setScale(1.2);
      }

      // Collisions and overlaps
      this.physics.add.overlap(player, cars, hitCar, null, this);
      this.physics.add.overlap(player, water, checkWaterDeath, null, this);
      this.physics.add.overlap(player, logs, rideLog, null, this);

      // Input handlers
      cursors = this.input.keyboard.createCursorKeys();

      // HUD with crypto styling
      const textStyle = { fontSize: '24px', fill: '#00ff00', fontFamily: 'monospace' };
      scoreText = this.add.text(16, 16, `ETH: ${score}`, textStyle).setScrollFactor(0);
      timerText = this.add.text(window.innerWidth-150, 16, 'Time: 300', textStyle).setScrollFactor(0);
      leaderboardText = this.add.text(16, 50, 'Whale Watch:', textStyle).setScrollFactor(0);
      instructionsText = this.add.text(window.innerWidth/2-200, 16, 
        `Arrow keys to move. Reach the top to win ${currentReward} ETH! Round ${currentRound}`, 
        textStyle).setScrollFactor(0);
      missedText = this.add.text(window.innerWidth/2-100, window.innerHeight/2, '', 
        { fontSize: '32px', fill: '#ff0000', fontFamily: 'monospace' }).setScrollFactor(0);

      // Timer
      timerEvent = this.time.addEvent({
        delay: 1000,
        callback: onTimerTick,
        callbackScope: this,
        loop: true,
      });

      socket.current.on('leaderboardUpdate', updateLeaderboard);
    }

    function update() {
      // Move cars and logs in loops
      cars.children.iterate(car => {
        if (car.x > window.innerWidth + 100) car.x = -100;
        if (car.x < -100) car.x = window.innerWidth + 100;
      });

      logs.children.iterate(log => {
        if (log.x > window.innerWidth + 200) log.x = -200;
        if (log.x < -200) log.x = window.innerWidth + 200;
      });

      // Player movement
      if (cursors.left.isDown) {
        player.setVelocityX(-160);
      } else if (cursors.right.isDown) {
        player.setVelocityX(160);
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-160);
      } else if (cursors.down.isDown) {
        player.setVelocityY(160);
      } else {
        player.setVelocityY(0);
      }

      // Check for win condition
      if (player.y < 50) {
        score += currentReward;
        currentRound++;
        currentReward *= 2; // Double the reward for next round
        scoreText.setText(`ETH: ${score}`);
        instructionsText.setText(`Arrow keys to move. Reach the top to win ${currentReward} ETH! Round ${currentRound}`);
        socket.current.emit('scoreUpdate', score);
        player.setPosition(window.innerWidth/2, window.innerHeight-50);
      }
    }

    function hitCar(player, car) {
      // Game over when hit by car
      timerEvent.remove();
      this.scene.pause();
      socket.current.emit('gameOver', score);
      missedText.setText('GAME OVER! Final Score: ' + score + ' ETH');
    }

    function checkWaterDeath(player, water) {
      let onLog = false;
      logs.children.iterate(log => {
        if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), log.getBounds())) {
          onLog = true;
        }
      });
      
      if (!onLog) {
        player.setPosition(window.innerWidth/2, window.innerHeight-50);
      }
    }

    function rideLog(player, log) {
      player.x += log.body.velocity.x/60;
    }

    function onTimerTick() {
      timeRemaining -= 1;
      timerText.setText('Time: ' + timeRemaining);

      if (timeRemaining <= 0) {
        timerEvent.remove();
        this.scene.pause();
        socket.current.emit('gameOver', score);
      }
    }

    function updateLeaderboard(leaderboard) {
      let leaderboardDisplay = 'Whale Watch:\n';
      leaderboard.forEach((player, idx) => {
        leaderboardDisplay += `${idx + 1}. ${player.name}: ${player.score} ETH\n`;
      });
      leaderboardText.setText(leaderboardDisplay);
    }

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return <div ref={gameContainer} style={{ width: '100vw', height: '100vh' }} />;
}

export default GameMap;