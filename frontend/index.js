const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io();

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const startBtn = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');

startBtn.addEventListener('click', startGame);

function startGame() {
  socket.emit('startGame');
}

let canvas, ctx;
let gameActive = false;

function handleInit() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);

  scoreDisplay.innerText = state.score;
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;
  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleGameState(gameState) {
  if (!gameActive) return;
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) return;
  data = JSON.parse(data);
  gameActive = false;
  document.removeEventListener('keydown', keydown);
  alert(`Game Over! Score: ${data.score}`);
  reset();
}

function reset() {
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  scoreDisplay.innerText = 0;
}
