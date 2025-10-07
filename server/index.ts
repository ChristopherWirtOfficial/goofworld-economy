import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState, PlayerAction, PlayerCooldown } from '../shared/types';
import { initializeGameState } from './game/initialize';
import { processAction } from './game/actions';
import { simulationTick } from './game/simulation';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Game state
let gameState: GameState = initializeGameState();
const playerCooldowns: Map<string, PlayerCooldown> = new Map();

// Constants
const TURN_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const SIMULATION_TICK_MS = 5 * 60 * 1000; // 5 minutes

// Simulation tick - runs every 5 minutes
setInterval(() => {
  console.log('Running simulation tick...');
  gameState = simulationTick(gameState);
  io.emit('gameStateUpdate', gameState);
}, SIMULATION_TICK_MS);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current game state to new connection
  socket.emit('gameStateUpdate', gameState);

  // Handle player actions
  socket.on('playerAction', (action: PlayerAction) => {
    const playerId = action.playerId;

    // Check cooldown
    const cooldown = playerCooldowns.get(playerId);
    const now = Date.now();

    if (cooldown && cooldown.nextActionTime > now) {
      socket.emit('actionError', {
        message: 'Action on cooldown',
        nextActionTime: cooldown.nextActionTime,
      });
      return;
    }

    // Process action
    try {
      gameState = processAction(gameState, action);

      // Set cooldown
      playerCooldowns.set(playerId, {
        playerId,
        nextActionTime: now + TURN_COOLDOWN_MS,
      });

      // Broadcast updated game state
      io.emit('gameStateUpdate', gameState);
      socket.emit('actionSuccess', {
        nextActionTime: now + TURN_COOLDOWN_MS,
      });
    } catch (error) {
      socket.emit('actionError', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Handle cooldown check
  socket.on('checkCooldown', (playerId: string) => {
    const cooldown = playerCooldowns.get(playerId);
    const now = Date.now();

    socket.emit('cooldownStatus', {
      onCooldown: cooldown ? cooldown.nextActionTime > now : false,
      nextActionTime: cooldown?.nextActionTime || now,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/gamestate', (req, res) => {
  res.json(gameState);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
