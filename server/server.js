const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '../frontend')));

const state = {};

io.on('connection', client => {
  let intervalId;

  client.on('startGame', handleStartGame);
  client.on('keydown', handleKeydown);

  function handleStartGame() {
    state[client.id] = initGame();
    client.emit('init');

    intervalId = setInterval(() => {
      const gameOver = gameLoop(state[client.id]);

      if (!gameOver) {
        client.emit('gameState', JSON.stringify(state[client.id]));
      } else {
        client.emit('gameOver', JSON.stringify({ score: state[client.id].score }));
        state[client.id] = null;
        clearInterval(intervalId);
      }
    }, 1000 / FRAME_RATE);
  }

  function handleKeydown(keyCode) {
    if (!state[client.id]) return;
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
    const vel = getUpdatedVelocity(keyCode);
    if (vel) {
      state[client.id].players[0].vel = vel;
    }
  }

  client.on('disconnect', () => {
    clearInterval(intervalId);
    delete state[client.id];
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
