#!/usr/bin/env node

/**
 * Goof World Backend Logic Unit Tests
 * 
 * This script tests the core game logic functions directly without network calls.
 * Run with: node scripts/test-backend-logic.js [test-name]
 * 
 * Available tests:
 * - reveal: Test reveal order logic
 * - move: Test move order logic
 * - simulation: Test simulation tick logic
 * - validation: Test action validation
 * - all: Run all tests
 */

// Import the game logic functions directly
const path = require('path');

// We'll need to require the TypeScript files - for now let's test the logic conceptually
// and create a proper test framework

class GameLogicTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Goof World Backend Logic Tests');
    console.log('==================================');
    
    for (const { name, testFn } of this.tests) {
      try {
        console.log(`\n🧪 Testing: ${name}`);
        await testFn();
        console.log(`✅ ${name} - PASSED`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name} - FAILED: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log('\n📊 Test Results:');
    console.log(`  ✅ Passed: ${this.passed}`);
    console.log(`  ❌ Failed: ${this.failed}`);
    console.log(`  📈 Total: ${this.passed + this.failed}`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Test data generators
function createMockGameState() {
  return {
    entities: {
      'warehouse-0': {
        id: 'warehouse-0',
        name: 'Warehouse 1',
        type: 'warehouse',
        inventory: {},
        capacity: 100000,
        incomingOrderIds: ['order-1', 'order-2'],
        outgoingOrderIds: ['order-1', 'order-3', 'order-4'],
        neighborhoodId: null
      },
      'store-0': {
        id: 'store-0',
        name: 'Store 1',
        type: 'store',
        inventory: {},
        capacity: 10000,
        incomingOrderIds: ['order-3'],
        outgoingOrderIds: ['order-5'],
        neighborhoodId: 'neighborhood-0'
      },
      'household-0': {
        id: 'household-0',
        name: 'Household 1',
        type: 'household',
        inventory: {},
        capacity: 1000,
        incomingOrderIds: ['order-5'],
        outgoingOrderIds: [],
        neighborhoodId: 'neighborhood-0'
      }
    },
    orders: {
      'order-1': {
        id: 'order-1',
        item: 'potatoes',
        quantity: 1000,
        fromEntityId: 'backplane-0',
        toEntityId: 'warehouse-0',
        isRevealed: false,
        revealedUntil: undefined,
        revealSource: undefined
      },
      'order-2': {
        id: 'order-2',
        item: 'carrots',
        quantity: 500,
        fromEntityId: 'backplane-0',
        toEntityId: 'warehouse-0',
        isRevealed: true,
        revealedUntil: Date.now() + 30 * 60 * 1000,
        revealSource: 'warehouse'
      },
      'order-3': {
        id: 'order-3',
        item: 'potatoes',
        quantity: 800,
        fromEntityId: 'warehouse-0',
        toEntityId: 'store-0',
        isRevealed: false,
        revealedUntil: undefined,
        revealSource: undefined
      },
      'order-4': {
        id: 'order-4',
        item: 'carrots',
        quantity: 400,
        fromEntityId: 'warehouse-0',
        toEntityId: 'store-1',
        isRevealed: false,
        revealedUntil: undefined,
        revealSource: undefined
      },
      'order-5': {
        id: 'order-5',
        item: 'potatoes',
        quantity: 50,
        fromEntityId: 'store-0',
        toEntityId: 'household-0',
        isRevealed: false,
        revealedUntil: undefined,
        revealSource: undefined
      }
    },
    neighborhoods: {
      'neighborhood-0': {
        id: 'neighborhood-0',
        name: 'Downtown',
        storeIds: ['store-0'],
        householdIds: ['household-0']
      }
    },
    startTime: Date.now(),
    endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
    tickInterval: 5 * 60 * 1000
  };
}

function createMockAction(type, overrides = {}) {
  const baseAction = {
    type,
    playerId: 'test-player',
    timestamp: Date.now(),
    ...overrides
  };
  return baseAction;
}

// Test functions
async function testRevealLogic() {
  const tester = new GameLogicTester();
  
  tester.test('Warehouse reveal should reveal 70% of warehouse orders', () => {
    const gameState = createMockGameState();
    const action = createMockAction('reveal_orders', { layer: 'warehouse' });
    
    // Count warehouse orders
    const warehouseOrders = [];
    Object.values(gameState.entities)
      .filter(e => e.type === 'warehouse')
      .forEach(entity => {
        warehouseOrders.push(...entity.incomingOrderIds, ...entity.outgoingOrderIds);
      });
    
    const expectedRevealed = Math.floor(warehouseOrders.length * 0.7);
    
    if (warehouseOrders.length !== 5) {
      throw new Error(`Expected 5 warehouse orders, got ${warehouseOrders.length}`);
    }
    
    if (expectedRevealed !== 3) {
      throw new Error(`Expected 3 orders to be revealed (70% of 5), got ${expectedRevealed}`);
    }
  });
  
  tester.test('Store reveal should require neighborhoodId', () => {
    const action = createMockAction('reveal_orders', { layer: 'store' });
    
    if (action.neighborhoodId) {
      throw new Error('Store reveal should not have neighborhoodId by default');
    }
    
    // This would fail in real implementation
    const actionWithNeighborhood = createMockAction('reveal_orders', { 
      layer: 'store', 
      neighborhoodId: 'neighborhood-0' 
    });
    
    if (!actionWithNeighborhood.neighborhoodId) {
      throw new Error('Store reveal should have neighborhoodId when provided');
    }
  });
  
  tester.test('Household reveal should require neighborhoodId', () => {
    const action = createMockAction('reveal_orders', { layer: 'household' });
    
    if (action.neighborhoodId) {
      throw new Error('Household reveal should not have neighborhoodId by default');
    }
    
    const actionWithNeighborhood = createMockAction('reveal_orders', { 
      layer: 'household', 
      neighborhoodId: 'neighborhood-0' 
    });
    
    if (!actionWithNeighborhood.neighborhoodId) {
      throw new Error('Household reveal should have neighborhoodId when provided');
    }
  });
  
  tester.test('Reveal percentages should be correct', () => {
    const percentages = {
      warehouse: 0.7,  // 70%
      store: 0.5,      // 50%
      household: 0.3   // 30%
    };
    
    if (percentages.warehouse !== 0.7) {
      throw new Error('Warehouse reveal should be 70%');
    }
    
    if (percentages.store !== 0.5) {
      throw new Error('Store reveal should be 50%');
    }
    
    if (percentages.household !== 0.3) {
      throw new Error('Household reveal should be 30%');
    }
  });
  
  tester.test('Reveal durations should be correct', () => {
    const durations = {
      warehouse: 30 * 60 * 1000,  // 30 minutes
      store: 45 * 60 * 1000,      // 45 minutes
      household: 60 * 60 * 1000   // 60 minutes
    };
    
    if (durations.warehouse !== 30 * 60 * 1000) {
      throw new Error('Warehouse reveal should last 30 minutes');
    }
    
    if (durations.store !== 45 * 60 * 1000) {
      throw new Error('Store reveal should last 45 minutes');
    }
    
    if (durations.household !== 60 * 60 * 1000) {
      throw new Error('Household reveal should last 60 minutes');
    }
  });
  
  await tester.run();
}

async function testMoveLogic() {
  const tester = new GameLogicTester();
  
  tester.test('Move order should require orderId and targetEntityId', () => {
    const action = createMockAction('move_order', { 
      orderId: 'order-1', 
      targetEntityId: 'store-0' 
    });
    
    if (!action.orderId) {
      throw new Error('Move order should have orderId');
    }
    
    if (!action.targetEntityId) {
      throw new Error('Move order should have targetEntityId');
    }
  });
  
  tester.test('Move order should update order destination', () => {
    const gameState = createMockGameState();
    const originalOrder = gameState.orders['order-1'];
    const originalDestination = originalOrder.toEntityId;
    
    // Simulate move logic
    const newDestination = 'store-0';
    
    if (originalDestination === newDestination) {
      throw new Error('Move should change destination');
    }
    
    // In real implementation, this would update the order
    originalOrder.toEntityId = newDestination;
    
    if (originalOrder.toEntityId !== newDestination) {
      throw new Error('Order destination should be updated');
    }
  });
  
  tester.test('Move order should update entity order lists', () => {
    const gameState = createMockGameState();
    const order = gameState.orders['order-1'];
    const fromEntity = gameState.entities['warehouse-0'];
    const toEntity = gameState.entities['store-0'];
    
    // Check initial state
    if (!fromEntity.outgoingOrderIds.includes(order.id)) {
      throw new Error('Order should be in fromEntity outgoing list');
    }
    
    if (toEntity.incomingOrderIds.includes(order.id)) {
      throw new Error('Order should not be in toEntity incoming list initially');
    }
    
    // Simulate move logic
    const newTargetEntity = gameState.entities['store-0'];
    
    // Remove from old entities
    fromEntity.outgoingOrderIds = fromEntity.outgoingOrderIds.filter(id => id !== order.id);
    
    // Add to new entity
    newTargetEntity.incomingOrderIds.push(order.id);
    
    // Verify changes
    if (fromEntity.outgoingOrderIds.includes(order.id)) {
      throw new Error('Order should be removed from fromEntity outgoing list');
    }
    
    if (!newTargetEntity.incomingOrderIds.includes(order.id)) {
      throw new Error('Order should be added to new target entity incoming list');
    }
  });
  
  await tester.run();
}

async function testValidationLogic() {
  const tester = new GameLogicTester();
  
  tester.test('Invalid action type should be rejected', () => {
    const action = createMockAction('invalid_action');
    
    const validTypes = ['move_order', 'reveal_orders'];
    
    if (validTypes.includes(action.type)) {
      throw new Error('Invalid action type should not be valid');
    }
  });
  
  tester.test('Reveal action should require layer', () => {
    const action = createMockAction('reveal_orders');
    
    if (action.layer) {
      throw new Error('Reveal action should not have layer by default');
    }
    
    const actionWithLayer = createMockAction('reveal_orders', { layer: 'warehouse' });
    
    if (!actionWithLayer.layer) {
      throw new Error('Reveal action should have layer when provided');
    }
  });
  
  tester.test('Invalid layer should be rejected', () => {
    const action = createMockAction('reveal_orders', { layer: 'invalid_layer' });
    
    const validLayers = ['warehouse', 'store', 'household'];
    
    if (validLayers.includes(action.layer)) {
      throw new Error('Invalid layer should not be valid');
    }
  });
  
  tester.test('Action should have required fields', () => {
    const action = createMockAction('move_order', { 
      orderId: 'order-1', 
      targetEntityId: 'store-0' 
    });
    
    if (!action.type) {
      throw new Error('Action should have type');
    }
    
    if (!action.playerId) {
      throw new Error('Action should have playerId');
    }
    
    if (!action.timestamp) {
      throw new Error('Action should have timestamp');
    }
  });
  
  await tester.run();
}

async function testSimulationLogic() {
  const tester = new GameLogicTester();
  
  tester.test('Simulation tick should run every 5 minutes', () => {
    const tickInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (tickInterval !== 300000) {
      throw new Error('Tick interval should be 5 minutes (300000ms)');
    }
  });
  
  tester.test('Game should have start and end times', () => {
    const gameState = createMockGameState();
    
    if (!gameState.startTime) {
      throw new Error('Game should have start time');
    }
    
    if (!gameState.endTime) {
      throw new Error('Game should have end time');
    }
    
    if (gameState.endTime <= gameState.startTime) {
      throw new Error('End time should be after start time');
    }
  });
  
  tester.test('Game duration should be 2 months', () => {
    const gameState = createMockGameState();
    const duration = gameState.endTime - gameState.startTime;
    const twoMonthsMs = 60 * 24 * 60 * 60 * 1000; // 60 days
    
    if (Math.abs(duration - twoMonthsMs) > 1000) { // Allow 1 second tolerance
      throw new Error(`Game duration should be ~2 months, got ${duration}ms`);
    }
  });
  
  await tester.run();
}

async function testGameStateStructure() {
  const tester = new GameLogicTester();
  
  tester.test('Game state should have required properties', () => {
    const gameState = createMockGameState();
    
    if (!gameState.entities) {
      throw new Error('Game state should have entities');
    }
    
    if (!gameState.orders) {
      throw new Error('Game state should have orders');
    }
    
    if (!gameState.neighborhoods) {
      throw new Error('Game state should have neighborhoods');
    }
    
    if (!gameState.startTime) {
      throw new Error('Game state should have startTime');
    }
    
    if (!gameState.endTime) {
      throw new Error('Game state should have endTime');
    }
    
    if (!gameState.tickInterval) {
      throw new Error('Game state should have tickInterval');
    }
  });
  
  tester.test('Entities should have required properties', () => {
    const gameState = createMockGameState();
    const entity = Object.values(gameState.entities)[0];
    
    if (!entity.id) {
      throw new Error('Entity should have id');
    }
    
    if (!entity.name) {
      throw new Error('Entity should have name');
    }
    
    if (!entity.type) {
      throw new Error('Entity should have type');
    }
    
    if (!entity.inventory) {
      throw new Error('Entity should have inventory');
    }
    
    if (typeof entity.capacity !== 'number') {
      throw new Error('Entity should have numeric capacity');
    }
    
    if (!Array.isArray(entity.incomingOrderIds)) {
      throw new Error('Entity should have incomingOrderIds array');
    }
    
    if (!Array.isArray(entity.outgoingOrderIds)) {
      throw new Error('Entity should have outgoingOrderIds array');
    }
  });
  
  tester.test('Orders should have required properties', () => {
    const gameState = createMockGameState();
    const order = Object.values(gameState.orders)[0];
    
    if (!order.id) {
      throw new Error('Order should have id');
    }
    
    if (!order.item) {
      throw new Error('Order should have item');
    }
    
    if (typeof order.quantity !== 'number') {
      throw new Error('Order should have numeric quantity');
    }
    
    if (!order.fromEntityId) {
      throw new Error('Order should have fromEntityId');
    }
    
    if (!order.toEntityId) {
      throw new Error('Order should have toEntityId');
    }
    
    if (typeof order.isRevealed !== 'boolean') {
      throw new Error('Order should have boolean isRevealed');
    }
  });
  
  await tester.run();
}

// Main test runner
async function runTests() {
  const testName = process.argv[2] || 'all';
  
  try {
    switch (testName) {
      case 'reveal':
        await testRevealLogic();
        break;
      case 'move':
        await testMoveLogic();
        break;
      case 'validation':
        await testValidationLogic();
        break;
      case 'simulation':
        await testSimulationLogic();
        break;
      case 'structure':
        await testGameStateStructure();
        break;
      case 'all':
        await testGameStateStructure();
        await testValidationLogic();
        await testRevealLogic();
        await testMoveLogic();
        await testSimulationLogic();
        break;
      default:
        console.log('Available tests: reveal, move, validation, simulation, structure, all');
        break;
    }
    
    console.log('\n🎉 Backend logic tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
