import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function TetrisGame() {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: gameContainer.current,
      width: 400,
      height: 600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      backgroundColor: '#000', // Black background for classic Tetris feel
      physics: {
        default: 'arcade',
        arcade: {
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

    // Game variables
    let cursors;
    let gameGrid;
    let currentPiece;
    let timerEvent;
    let score = 0;
    let scoreText;
    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 20;
    const BLOCK_SIZE = 30;

    function preload() {
      // Load assets for Tetris blocks
      this.load.image('block', '/assets/block.png');
    }

    function create() {
      // Initialize the game grid
      gameGrid = Array.from({ length: GRID_HEIGHT }, () =>
        Array(GRID_WIDTH).fill(0)
      );

      // Input handlers
      cursors = this.input.keyboard.createCursorKeys();

      // Create the first piece
      spawnPiece(this);

      // Add score text
      scoreText = this.add.text(16, 16, `Score: ${score}`, {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      });

      // Timer for automatic piece movement
      timerEvent = this.time.addEvent({
        delay: 500, // Move down every 500ms
        callback: movePieceDown,
        callbackScope: this,
        loop: true,
      });
    }

    function update() {
      // Handle user input
      if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        movePiece(-1);
      } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        movePiece(1);
      } else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        rotatePiece();
      } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
        movePieceDown();
      }
    }

    function spawnPiece(scene) {
      // Define Tetris shapes
      const shapes = [
        // I Shape
        [[1, 1, 1, 1]],
        // O Shape
        [
          [1, 1],
          [1, 1],
        ],
        // T Shape
        [
          [0, 1, 0],
          [1, 1, 1],
        ],
        // S Shape
        [
          [0, 1, 1],
          [1, 1, 0],
        ],
        // Z Shape
        [
          [1, 1, 0],
          [0, 1, 1],
        ],
        // J Shape
        [
          [1, 0, 0],
          [1, 1, 1],
        ],
        // L Shape
        [
          [0, 0, 1],
          [1, 1, 1],
        ],
      ];

      // Randomly select a shape
      const shape =
        shapes[Math.floor(Math.random() * shapes.length)];

      // Create piece object
      currentPiece = {
        shape,
        x: Math.floor(GRID_WIDTH / 2) - Math.ceil(shape[0].length / 2),
        y: 0,
        blocks: [],
      };

      // Render the piece
      renderPiece(scene);
    }

    function renderPiece(scene) {
      // Remove previous blocks
      currentPiece.blocks.forEach(block => block.destroy());
      currentPiece.blocks = [];

      // Create new blocks
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const block = scene.add
              .image(
                (currentPiece.x + x) * BLOCK_SIZE,
                (currentPiece.y + y) * BLOCK_SIZE,
                'block'
              )
              .setOrigin(0)
              .setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);
            currentPiece.blocks.push(block);
          }
        });
      });
    }

    function movePiece(direction) {
      currentPiece.x += direction;
      if (isValidPosition()) {
        renderPiece(this);
      } else {
        currentPiece.x -= direction;
      }
    }

    function movePieceDown() {
      currentPiece.y += 1;
      if (isValidPosition()) {
        renderPiece(this);
      } else {
        currentPiece.y -= 1;
        addPieceToGrid();
        clearLines();
        spawnPiece(this);
        if (!isValidPosition()) {
          // Game over
          this.scene.pause();
          timerEvent.remove();
          // Display Game Over message
          this.add.text(100, 250, 'Game Over', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Inter, system-ui, sans-serif',
          });
        }
      }
    }

    function rotatePiece() {
      // Rotate the shape
      const rotatedShape = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
      );

      const originalShape = currentPiece.shape;
      currentPiece.shape = rotatedShape;
      if (isValidPosition()) {
        renderPiece(this);
      } else {
        currentPiece.shape = originalShape;
      }
    }

    function isValidPosition() {
      return currentPiece.shape.every((row, y) =>
        row.every((cell, x) => {
          if (cell) {
            const newX = currentPiece.x + x;
            const newY = currentPiece.y + y;

            return (
              newX >= 0 &&
              newX < GRID_WIDTH &&
              newY < GRID_HEIGHT &&
              (newY < 0 || !gameGrid[newY][newX])
            );
          }
          return true;
        })
      );
    }

    function addPieceToGrid() {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const gridY = currentPiece.y + y;
            const gridX = currentPiece.x + x;
            if (gridY >= 0) {
              gameGrid[gridY][gridX] = 1;
            }
          }
        });
      });
    }

    function clearLines() {
      let linesCleared = 0;
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (gameGrid[y].every(cell => cell)) {
          gameGrid.splice(y, 1);
          gameGrid.unshift(Array(GRID_WIDTH).fill(0));
          linesCleared += 1;
          y++;
        }
      }
      if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreText.setText(`Score: ${score}`);
      }
    }

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
      }
    };
  }, []);

  return (
    <div
      ref={gameContainer}
      style={{ width: '100%', height: '100vh' }}
    />
  );
}

export default TetrisGame; 