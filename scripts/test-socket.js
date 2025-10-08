#!/usr/bin/env node

/**
 * Goof World Socket.io Testing Script
 * 
 * This script tests real-time game mechanics via Socket.io connections.
 * Run with: node scripts/test-socket.js [test-name]
 * 
 * Available tests:
 * - reveal: Test neighborhood-scoped reveal mechanics
 * - move: Test order movement between entities
 * - multiplayer: Test multiple players interacting
 * - all: Run all tests
 */

const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';

// Utility functions
function generatePlayerId() {
  return `player_${Math.random().toString(36).substring(2, 8)}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testRevealMechanics() {
  console.log('\n🧪 Testing Reveal Mechanics via Socket.io...');
  
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    const playerId = generatePlayerId();
    
    socket.on('connect', async () => {
      console.log(`✅ Connected as player: ${playerId}`);
      
      try {
        // Wait for initial game state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test warehouse reveal (layer-level)
        console.log('🏭 Testing warehouse reveal...');
        const warehouseRevealAction = {
          type: 'reveal_orders',
          playerId,
          timestamp: Date.now(),
          layer: 'warehouse'
        };
        
        socket.emit('playerAction', warehouseRevealAction);
        console.log('📤 Sent warehouse reveal action');
        
        // Wait for response
        await sleep(2000);
        
        // Test neighborhood reveal (neighborhood-scoped)
        console.log('🏘️ Testing neighborhood reveal...');
        const neighborhoodRevealAction = {
          type: 'reveal_orders',
          playerId,
          timestamp: Date.now(),
          layer: 'store',
          neighborhoodId: 'neighborhood-0' // Test with first neighborhood
        };
        
        socket.emit('playerAction', neighborhoodRevealAction);
        console.log('📤 Sent neighborhood reveal action');
        
        // Wait for response
        await sleep(2000);
        
        console.log('✅ Reveal mechanics test completed');
        socket.disconnect();
        resolve();
        
      } catch (error) {
        console.error('❌ Reveal mechanics test failed:', error.message);
        socket.disconnect();
        reject(error);
      }
    });
    
    socket.on('gameStateUpdate', (gameState) => {
      console.log('📊 Game state updated');
      const revealedOrders = Object.values(gameState.orders).filter(o => o.isRevealed).length;
      console.log(`👁️ Revealed orders: ${revealedOrders}`);
    });
    
    socket.on('actionSuccess', (data) => {
      console.log('✅ Action successful:', data);
    });
    
    socket.on('actionError', (error) => {
      console.error('❌ Action failed:', error.message);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    });
  });
}

async function testMoveOrders() {
  console.log('\n🧪 Testing Move Orders via Socket.io...');
  
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    const playerId = generatePlayerId();
    
    socket.on('connect', async () => {
      console.log(`✅ Connected as player: ${playerId}`);
      
      try {
        // Wait for initial game state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test move order action
        console.log('📦 Testing move order...');
        const moveAction = {
          type: 'move_order',
          playerId,
          timestamp: Date.now(),
          orderId: 'order-0', // Test with first order
          targetEntityId: 'store-0' // Test moving to first store
        };
        
        socket.emit('playerAction', moveAction);
        console.log('📤 Sent move order action');
        
        // Wait for response
        await sleep(2000);
        
        console.log('✅ Move orders test completed');
        socket.disconnect();
        resolve();
        
      } catch (error) {
        console.error('❌ Move orders test failed:', error.message);
        socket.disconnect();
        reject(error);
      }
    });
    
    socket.on('gameStateUpdate', (gameState) => {
      console.log('📊 Game state updated');
    });
    
    socket.on('actionSuccess', (data) => {
      console.log('✅ Action successful:', data);
    });
    
    socket.on('actionError', (error) => {
      console.error('❌ Action failed:', error.message);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    });
  });
}

async function testMultiplayer() {
  console.log('\n🧪 Testing Multiplayer via Socket.io...');
  
  return new Promise((resolve, reject) => {
    const player1 = generatePlayerId();
    const player2 = generatePlayerId();
    
    const socket1 = io(SERVER_URL);
    const socket2 = io(SERVER_URL);
    
    let connectedCount = 0;
    
    const onConnect = (socket, playerId) => {
      return new Promise((resolve) => {
        socket.on('connect', () => {
          console.log(`✅ Player ${playerId} connected`);
          connectedCount++;
          
          if (connectedCount === 2) {
            resolve();
          }
        });
        
        socket.on('gameStateUpdate', (gameState) => {
          console.log(`📊 Player ${playerId} received game state update`);
        });
        
        socket.on('actionSuccess', (data) => {
          console.log(`✅ Player ${playerId} action successful:`, data);
        });
        
        socket.on('actionError', (error) => {
          console.error(`❌ Player ${playerId} action failed:`, error.message);
        });
      });
    };
    
    Promise.all([
      onConnect(socket1, player1),
      onConnect(socket2, player2)
    ]).then(async () => {
      try {
        console.log('🎮 Both players connected, testing interactions...');
        
        // Player 1 performs warehouse reveal
        console.log('🏭 Player 1 performing warehouse reveal...');
        socket1.emit('playerAction', {
          type: 'reveal_orders',
          playerId: player1,
          timestamp: Date.now(),
          layer: 'warehouse'
        });
        
        await sleep(1000);
        
        // Player 2 performs neighborhood reveal
        console.log('🏘️ Player 2 performing neighborhood reveal...');
        socket2.emit('playerAction', {
          type: 'reveal_orders',
          playerId: player2,
          timestamp: Date.now(),
          layer: 'store',
          neighborhoodId: 'neighborhood-1'
        });
        
        await sleep(2000);
        
        console.log('✅ Multiplayer test completed');
        socket1.disconnect();
        socket2.disconnect();
        resolve();
        
      } catch (error) {
        console.error('❌ Multiplayer test failed:', error.message);
        socket1.disconnect();
        socket2.disconnect();
        reject(error);
      }
    });
    
    socket1.on('connect_error', (error) => {
      console.error('❌ Player 1 connection failed:', error.message);
      reject(error);
    });
    
    socket2.on('connect_error', (error) => {
      console.error('❌ Player 2 connection failed:', error.message);
      reject(error);
    });
  });
}

async function testCooldownSystem() {
  console.log('\n🧪 Testing Cooldown System...');
  
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);
    const playerId = generatePlayerId();
    
    socket.on('connect', async () => {
      console.log(`✅ Connected as player: ${playerId}`);
      
      try {
        // Check initial cooldown status
        console.log('⏰ Checking cooldown status...');
        socket.emit('checkCooldown', playerId);
        
        await sleep(1000);
        
        // Perform an action
        console.log('🏭 Performing warehouse reveal...');
        socket.emit('playerAction', {
          type: 'reveal_orders',
          playerId,
          timestamp: Date.now(),
          layer: 'warehouse'
        });
        
        await sleep(1000);
        
        // Check cooldown status again
        console.log('⏰ Checking cooldown status after action...');
        socket.emit('checkCooldown', playerId);
        
        await sleep(2000);
        
        console.log('✅ Cooldown system test completed');
        socket.disconnect();
        resolve();
        
      } catch (error) {
        console.error('❌ Cooldown system test failed:', error.message);
        socket.disconnect();
        reject(error);
      }
    });
    
    socket.on('cooldownStatus', (data) => {
      console.log('⏰ Cooldown status:', data);
    });
    
    socket.on('actionSuccess', (data) => {
      console.log('✅ Action successful:', data);
    });
    
    socket.on('actionError', (error) => {
      console.error('❌ Action failed:', error.message);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    });
  });
}

// Main test runner
async function runTests() {
  const testName = process.argv[2] || 'all';
  
  console.log('🎮 Goof World Socket.io Testing Suite');
  console.log('=====================================');
  
  try {
    switch (testName) {
      case 'reveal':
        await testRevealMechanics();
        break;
      case 'move':
        await testMoveOrders();
        break;
      case 'multiplayer':
        await testMultiplayer();
        break;
      case 'cooldown':
        await testCooldownSystem();
        break;
      case 'all':
        await testRevealMechanics();
        await testMoveOrders();
        await testMultiplayer();
        await testCooldownSystem();
        break;
      default:
        console.log('Available tests: reveal, move, multiplayer, cooldown, all');
        break;
    }
    
    console.log('\n🎉 Socket.io testing completed!');
    
  } catch (error) {
    console.error('💥 Socket.io test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
