import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { GameState, PlayerAction, PlayerCooldown } from '../shared/types';
import { initializeGameState } from './game/initialize';
import { processAction } from './game/actions';
import { simulationTick } from './game/simulation';
import { initializeDatabase } from './db/schema';
import { GameStateRepository } from './db/gameState';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [/\.vercel\.app$/, /\.railway\.app$/] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /\.railway\.app$/] 
    : ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Initialize database
const db = initializeDatabase();
const gameStateRepo = new GameStateRepository(db);

// Load or initialize game state
let gameState: GameState;

if (gameStateRepo.gameStateExists()) {
  console.log('Loading existing game state from database...');
  const loadedState = gameStateRepo.loadGameState();
  if (loadedState) {
    gameState = loadedState;
    console.log('Game state loaded successfully');
  } else {
    console.log('Failed to load game state, initializing new one');
    gameState = initializeGameState();
    gameStateRepo.saveGameState(gameState);
  }
} else {
  console.log('No existing game state found, initializing new one');
  gameState = initializeGameState();
  gameStateRepo.saveGameState(gameState);
}

const playerCooldowns: Map<string, PlayerCooldown> = new Map();

// Constants
const TURN_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const SIMULATION_TICK_MS = 5 * 60 * 1000; // 5 minutes

// Simulation tick - runs every 5 minutes
setInterval(() => {
  console.log('Running simulation tick...');
  gameState = simulationTick(gameState);
  gameStateRepo.saveGameState(gameState);
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

    // TODO: Add turn cooldown system (currently disabled for development)
    // Check cooldown
    // const cooldown = playerCooldowns.get(playerId);
    // const now = Date.now();

    // if (cooldown && cooldown.nextActionTime > now) {
    //   socket.emit('actionError', {
    //     message: 'Action on cooldown',
    //     nextActionTime: cooldown.nextActionTime,
    //   });
    //   return;
    // }

    // Process action
    try {
      gameState = processAction(gameState, action);
      
      // Save to database
      gameStateRepo.saveGameState(gameState);
      
      // Log player action
      gameStateRepo.logPlayerAction(playerId, action.type, action);

      // TODO: Add turn cooldown system (currently disabled for development)
      // Set cooldown
      // playerCooldowns.set(playerId, {
      //   playerId,
      //   nextActionTime: now + TURN_COOLDOWN_MS,
      // });

      // Broadcast updated game state
      io.emit('gameStateUpdate', gameState);
      socket.emit('actionSuccess', {
        nextActionTime: Date.now(), // No cooldown for development
      });
    } catch (error) {
      socket.emit('actionError', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // TODO: Add turn cooldown system (currently disabled for development)
  // Handle cooldown check
  socket.on('checkCooldown', (playerId: string) => {
    // const cooldown = playerCooldowns.get(playerId);
    // const now = Date.now();

    socket.emit('cooldownStatus', {
      onCooldown: false, // No cooldown for development
      nextActionTime: Date.now(),
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

app.get('/api/actions', (req, res) => {
  const playerId = req.query.playerId as string | undefined;
  const limit = parseInt(req.query.limit as string) || 100;
  const actions = gameStateRepo.getPlayerActions(playerId, limit);
  res.json(actions);
});

app.post('/api/reset', (req, res) => {
  console.log('Resetting game state...');
  gameState = initializeGameState();
  gameStateRepo.saveGameState(gameState);
  io.emit('gameStateUpdate', gameState);
  res.json({ success: true, message: 'Game state reset' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
