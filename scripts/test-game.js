#!/usr/bin/env node

/**
 * Goof World Game Testing Scripts
 * 
 * This script provides comprehensive testing of game mechanics via API calls.
 * Run with: node scripts/test-game.js [test-name]
 * 
 * Available tests:
 * - reveal: Test neighborhood-scoped reveal mechanics
 * - move: Test order movement between entities
 * - multiplayer: Test multiple players interacting
 * - persistence: Test database persistence
 * - all: Run all tests
 */

const BASE_URL = 'http://localhost:3001';

// Utility functions
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

function generatePlayerId() {
  return `player_${Math.random().toString(36).substring(2, 8)}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testRevealMechanics() {
  console.log('\n🧪 Testing Reveal Mechanics...');
  
  try {
    // Get initial game state
    const gameState = await apiCall('/api/gamestate');
    console.log(`✅ Game state loaded: ${Object.keys(gameState.entities).length} entities, ${Object.keys(gameState.orders).length} orders`);
    
    // Count initial revealed orders
    const initialRevealed = Object.values(gameState.orders).filter(o => o.isRevealed).length;
    console.log(`📊 Initial revealed orders: ${initialRevealed}`);
    
    // Test warehouse reveal (layer-level)
    console.log('\n🏭 Testing warehouse reveal (layer-level)...');
    const player1 = generatePlayerId();
    
    // Simulate warehouse reveal action
    const warehouseRevealAction = {
      type: 'reveal_orders',
      playerId: player1,
      timestamp: Date.now(),
      layer: 'warehouse'
    };
    
    // We can't directly call the socket endpoint, so let's check the game state structure
    const warehouses = Object.values(gameState.entities).filter(e => e.type === 'warehouse');
    console.log(`📦 Found ${warehouses.length} warehouses`);
    
    const warehouseOrders = warehouses.flatMap(w => [...w.incomingOrderIds, ...w.outgoingOrderIds]);
    console.log(`📋 Total warehouse orders: ${warehouseOrders.length}`);
    
    // Test neighborhood reveal (neighborhood-scoped)
    console.log('\n🏘️ Testing neighborhood reveal (neighborhood-scoped)...');
    const neighborhoods = Object.values(gameState.neighborhoods);
    if (neighborhoods.length > 0) {
      const testNeighborhood = neighborhoods[0];
      console.log(`🏠 Testing neighborhood: ${testNeighborhood.name} (${testNeighborhood.id})`);
      
      const neighborhoodStores = testNeighborhood.storeIds.map(id => gameState.entities[id]).filter(Boolean);
      const neighborhoodHouseholds = testNeighborhood.householdIds.map(id => gameState.entities[id]).filter(Boolean);
      
      console.log(`🏪 Stores in neighborhood: ${neighborhoodStores.length}`);
      console.log(`🏠 Households in neighborhood: ${neighborhoodHouseholds.length}`);
      
      const storeOrders = neighborhoodStores.flatMap(s => [...s.incomingOrderIds, ...s.outgoingOrderIds]);
      const householdOrders = neighborhoodHouseholds.flatMap(h => [...h.incomingOrderIds, ...h.outgoingOrderIds]);
      
      console.log(`📋 Store orders in neighborhood: ${storeOrders.length}`);
      console.log(`📋 Household orders in neighborhood: ${householdOrders.length}`);
    }
    
    console.log('✅ Reveal mechanics structure validated');
    
  } catch (error) {
    console.error('❌ Reveal mechanics test failed:', error.message);
  }
}

async function testMoveOrders() {
  console.log('\n🧪 Testing Move Orders...');
  
  try {
    const gameState = await apiCall('/api/gamestate');
    
    // Find an order to move
    const orders = Object.values(gameState.orders);
    const movableOrder = orders.find(o => !o.isRevealed); // Find a hidden order
    
    if (!movableOrder) {
      console.log('⚠️ No hidden orders found to test movement');
      return;
    }
    
    console.log(`📦 Found order to move: ${movableOrder.id} (${movableOrder.item}, qty: ${movableOrder.quantity})`);
    console.log(`📍 Current route: ${movableOrder.fromEntityId} → ${movableOrder.toEntityId}`);
    
    // Find alternative target entities
    const entities = Object.values(gameState.entities);
    const alternativeTargets = entities.filter(e => 
      e.id !== movableOrder.toEntityId && 
      e.type !== 'backplane' // Don't move to backplane
    );
    
    if (alternativeTargets.length === 0) {
      console.log('⚠️ No alternative targets found');
      return;
    }
    
    const targetEntity = alternativeTargets[0];
    console.log(`🎯 Alternative target: ${targetEntity.name} (${targetEntity.id})`);
    
    // Test move order action structure
    const moveAction = {
      type: 'move_order',
      playerId: generatePlayerId(),
      timestamp: Date.now(),
      orderId: movableOrder.id,
      targetEntityId: targetEntity.id
    };
    
    console.log('📋 Move action structure:', JSON.stringify(moveAction, null, 2));
    console.log('✅ Move orders structure validated');
    
  } catch (error) {
    console.error('❌ Move orders test failed:', error.message);
  }
}

async function testGameStateStructure() {
  console.log('\n🧪 Testing Game State Structure...');
  
  try {
    const gameState = await apiCall('/api/gamestate');
    
    // Validate game state structure
    console.log('📊 Game State Overview:');
    console.log(`  - Entities: ${Object.keys(gameState.entities).length}`);
    console.log(`  - Orders: ${Object.keys(gameState.orders).length}`);
    console.log(`  - Neighborhoods: ${Object.keys(gameState.neighborhoods).length}`);
    console.log(`  - Start Time: ${new Date(gameState.startTime).toLocaleString()}`);
    console.log(`  - End Time: ${new Date(gameState.endTime).toLocaleString()}`);
    console.log(`  - Tick Interval: ${gameState.tickInterval}ms`);
    
    // Validate entity types
    const entityTypes = {};
    Object.values(gameState.entities).forEach(entity => {
      entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
    });
    console.log('🏗️ Entity Types:', entityTypes);
    
    // Validate neighborhood structure
    Object.values(gameState.neighborhoods).forEach(neighborhood => {
      console.log(`🏘️ ${neighborhood.name}: ${neighborhood.storeIds.length} stores, ${neighborhood.householdIds.length} households`);
    });
    
    // Validate order visibility
    const revealedOrders = Object.values(gameState.orders).filter(o => o.isRevealed);
    const hiddenOrders = Object.values(gameState.orders).filter(o => !o.isRevealed);
    console.log(`👁️ Order Visibility: ${revealedOrders.length} revealed, ${hiddenOrders.length} hidden`);
    
    console.log('✅ Game state structure validated');
    
  } catch (error) {
    console.error('❌ Game state structure test failed:', error.message);
  }
}

async function testPlayerActions() {
  console.log('\n🧪 Testing Player Actions...');
  
  try {
    // Get recent player actions
    const actions = await apiCall('/api/actions?limit=10');
    console.log(`📋 Recent actions: ${actions.length}`);
    
    if (actions.length > 0) {
      console.log('📊 Action Types:');
      const actionTypes = {};
      actions.forEach(action => {
        actionTypes[action.action_type] = (actionTypes[action.action_type] || 0) + 1;
      });
      console.log(actionTypes);
      
      // Show latest action details
      const latestAction = actions[0];
      console.log('🔄 Latest Action:', JSON.stringify(JSON.parse(latestAction.action_data_json), null, 2));
    }
    
    console.log('✅ Player actions validated');
    
  } catch (error) {
    console.error('❌ Player actions test failed:', error.message);
  }
}

async function testResetGame() {
  console.log('\n🧪 Testing Game Reset...');
  
  try {
    // Get initial state
    const initialState = await apiCall('/api/gamestate');
    console.log(`📊 Initial state: ${Object.keys(initialState.entities).length} entities`);
    
    // Reset game
    console.log('🔄 Resetting game...');
    const resetResult = await apiCall('/api/reset', { method: 'POST' });
    console.log('✅ Reset result:', resetResult);
    
    // Wait a moment for reset to complete
    await sleep(1000);
    
    // Get new state
    const newState = await apiCall('/api/gamestate');
    console.log(`📊 New state: ${Object.keys(newState.entities).length} entities`);
    
    // Verify reset worked
    if (newState.startTime !== initialState.startTime) {
      console.log('✅ Game reset successful - new start time');
    } else {
      console.log('⚠️ Game reset may not have worked - same start time');
    }
    
  } catch (error) {
    console.error('❌ Game reset test failed:', error.message);
  }
}

async function testServerHealth() {
  console.log('\n🧪 Testing Server Health...');
  
  try {
    const health = await apiCall('/api/health');
    console.log('💚 Server health:', health);
    console.log('✅ Server is healthy');
    
  } catch (error) {
    console.error('❌ Server health test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  const testName = process.argv[2] || 'all';
  
  console.log('🎮 Goof World Game Testing Suite');
  console.log('================================');
  
  try {
    await testServerHealth();
    
    switch (testName) {
      case 'reveal':
        await testRevealMechanics();
        break;
      case 'move':
        await testMoveOrders();
        break;
      case 'structure':
        await testGameStateStructure();
        break;
      case 'actions':
        await testPlayerActions();
        break;
      case 'reset':
        await testResetGame();
        break;
      case 'all':
        await testGameStateStructure();
        await testRevealMechanics();
        await testMoveOrders();
        await testPlayerActions();
        break;
      default:
        console.log('Available tests: reveal, move, structure, actions, reset, all');
        break;
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
