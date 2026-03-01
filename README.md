# Snake Game

A single-player Snake game built with **Node.js**, **Socket.io**, and vanilla JavaScript. The game logic runs on the server and streams state to the browser in real time.

---

## Demo

> Deploy to [Render](https://render.com) for a free hosted version (see [Deployment](#deployment) below).

---

## How It Works

### Architecture

```
Browser (frontend)  <──── WebSocket (Socket.io) ────>  Node.js Server (backend)
  index.html                                              server.js
  index.js                                               game.js
```

The browser and server communicate in real-time via **Socket.io** (WebSockets). All game logic lives on the server — the browser is purely a renderer.

---

### Flow: Start to Game Over

#### 1. User clicks "Start Game"
The browser emits a `startGame` event to the server via Socket.io.

#### 2. Server creates a game state
The server calls `initGame()` and stores it under `state[client.id]` — each connected player gets their own independent game.

The initial state looks like this:
```js
{
  players: [{ pos, vel, snake }],  // one snake, starting mid-left
  food: {},                         // placed at a random position
  score: 0,
  gridsize: 20
}
```

#### 3. Game loop ticks
A `setInterval` fires `gameLoop()` at `FRAME_RATE` times per second.

Each tick:
1. Move head: `pos.x += vel.x`, `pos.y += vel.y`
2. Check **wall collision** → game over
3. Check **food collision** → grow snake, increment score, spawn new food
4. Check **self collision** → game over
5. Otherwise → push new head, pop tail (snake moves forward)

#### 4. Server sends state to browser
After each tick, the server emits the full game state as JSON to the browser.

#### 5. Browser renders the frame
`paintGame()` draws everything on an HTML `<canvas>`:
- Background filled black
- Food drawn as an orange square
- Each snake cell drawn as a grey square
- Score display updated

#### 6. Player presses a key
The browser emits `keydown` with the key code. The server maps it to a velocity and updates the player's direction. On the next tick, the snake moves in the new direction.

#### 7. Game Over
The server detects a collision, emits `gameOver` with the final score. The browser shows an alert and returns to the start screen.

---

### Key Design Decisions

| Decision | Why |
|----------|-----|
| Game logic on server | Prevents cheating; browser cannot manipulate game state |
| Full state sent every frame | Simple — the browser never needs to track anything itself |
| One game per socket connection | Each tab/player gets a completely independent game |
| `vel` not `pos` for input | Player sets a direction; the loop applies it each tick |

---

## Project Structure

```
├── frontend/
│   ├── index.html      # Game UI (start screen + canvas)
│   └── index.js        # Socket.io client, rendering logic
└── server/
    ├── server.js       # Express + Socket.io server
    ├── game.js         # Game logic (loop, collisions, food)
    ├── constants.js    # GRID_SIZE, FRAME_RATE
    └── package.json
```

---

## Running Locally

```bash
cd server
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Use **arrow keys** to control the snake.

---

## Deployment

This project is set up for **all-in-one deployment** — Express serves the frontend static files, so only one service is needed.

### Deploy to Render (free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo and configure:

| Setting | Value |
|---------|-------|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

4. Click **Create Web Service** — Render will give you a public URL.

> **Note:** The free tier sleeps after 15 minutes of inactivity. The first load after sleep takes ~30 seconds.

---

## Controls

| Key | Action |
|-----|--------|
| ← | Move left |
| → | Move right |
| ↑ | Move up |
| ↓ | Move down |
