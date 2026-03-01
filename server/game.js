const { GRID_SIZE } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

function initGame() {
  const state = createGameState();
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [{
      pos: { x: 3, y: 10 },
      vel: { x: 1, y: 0 },
      snake: [
        { x: 1, y: 10 },
        { x: 2, y: 10 },
        { x: 3, y: 10 },
      ],
    }],
    food: {},
    gridsize: GRID_SIZE,
    score: 0,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const player = state.players[0];

  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;

  if (player.pos.x < 0 || player.pos.x >= GRID_SIZE || player.pos.y < 0 || player.pos.y >= GRID_SIZE) {
    return true;
  }

  if (state.food.x === player.pos.x && state.food.y === player.pos.y) {
    player.snake.push({ ...player.pos });
    state.score++;
    randomFood(state);
    return false;
  }

  if (player.vel.x || player.vel.y) {
    for (let cell of player.snake) {
      if (cell.x === player.pos.x && cell.y === player.pos.y) {
        return true;
      }
    }

    player.snake.push({ ...player.pos });
    player.snake.shift();
  }

  return false;
}

function randomFood(state) {
  const food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: return { x: -1, y: 0 };  // left
    case 38: return { x: 0, y: -1 };  // up
    case 39: return { x: 1, y: 0 };   // right
    case 40: return { x: 0, y: 1 };   // down
  }
}
