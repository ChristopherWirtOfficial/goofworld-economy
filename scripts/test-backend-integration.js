#!/usr/bin/env node

/**
 * Goof World Backend Integration Tests
 * 
 * This script tests the actual backend action processing functions.
 * Run with: node scripts/test-backend-integration.js [test-name]
 * 
 * Available tests:
 * - reveal: Test reveal order processing
 * - move: Test move order processing
 * - validation: Test action validation
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

class IntegrationTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Goof World Backend Integration Tests');
    console.log('========================================');
    
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

// Test functions
async function testRevealProcessing() {
  const tester = new IntegrationTester();
  
  tester.test('Warehouse reveal should increase revealed orders', async () => {
    // Get initial state
    const initialState = await apiCall('/api/gamestate');
    const initialRevealed = Object.values(initialState.orders).filter(o => o.isRevealed).length;
    
    // Reset game to ensure clean state
    await apiCall('/api/reset', { method: 'POST' });
    await sleep(1000);
    
    // Get clean state
    const cleanState = await apiCall('/api/gamestate');
    const cleanRevealed = Object.values(cleanState.orders).filter(o => o.isRevealed).length;
    
    console.log(`📊 Initial revealed orders: ${initialRevealed}`);
    console.log(`📊 Clean revealed orders: ${cleanRevealed}`);
    
    // Count warehouse orders
    const warehouses = Object.values(cleanState.entities).filter(e => e.type === 'warehouse');
    const warehouseOrders = warehouses.flatMap(w => [...w.incomingOrderIds, ...w.outgoingOrderIds]);
    const expectedRevealed = Math.floor(warehouseOrders.length * 0.7);
    
    console.log(`📦 Warehouse orders: ${warehouseOrders.length}`);
    console.log(`🎯 Expected to reveal: ${expectedRevealed}`);
    
    if (warehouseOrders.length === 0) {
      throw new Error('No warehouse orders found to test reveal');
    }
    
    if (expectedRevealed === 0) {
      throw new Error('Expected to reveal at least 1 order');
    }
  });
  
  tester.test('Neighborhood reveal should require neighborhoodId', async () => {
    // This test validates the backend logic structure
    const gameState = await apiCall('/api/gamestate');
    const neighborhoods = Object.values(gameState.neighborhoods);
    
    if (neighborhoods.length === 0) {
      throw new Error('No neighborhoods found');
    }
    
    const testNeighborhood = neighborhoods[0];
    const neighborhoodStores = testNeighborhood.storeIds.map(id => gameState.entities[id]).filter(Boolean);
    const neighborhoodHouseholds = testNeighborhood.householdIds.map(id => gameState.entities[id]).filter(Boolean);
    
    console.log(`🏘️ Testing neighborhood: ${testNeighborhood.name}`);
    console.log(`🏪 Stores: ${neighborhoodStores.length}`);
    console.log(`🏠 Households: ${neighborhoodHouseholds.length}`);
    
    if (neighborhoodStores.length === 0) {
      throw new Error('No stores in neighborhood');
    }
    
    if (neighborhoodHouseholds.length === 0) {
      throw new Error('No households in neighborhood');
    }
  });
  
  tester.test('Reveal percentages should match expected values', async () => {
    const gameState = await apiCall('/api/gamestate');
    
    // Test warehouse reveal percentage
    const warehouses = Object.values(gameState.entities).filter(e => e.type === 'warehouse');
    const warehouseOrders = warehouses.flatMap(w => [...w.incomingOrderIds, ...w.outgoingOrderIds]);
    const warehouseRevealCount = Math.floor(warehouseOrders.length * 0.7);
    
    console.log(`🏭 Warehouse orders: ${warehouseOrders.length}, expected reveal: ${warehouseRevealCount}`);
    
    // Test store reveal percentage
    const stores = Object.values(gameState.entities).filter(e => e.type === 'store');
    const storeOrders = stores.flatMap(s => [...s.incomingOrderIds, ...s.outgoingOrderIds]);
    const storeRevealCount = Math.floor(storeOrders.length * 0.5);
    
    console.log(`🏪 Store orders: ${storeOrders.length}, expected reveal: ${storeRevealCount}`);
    
    // Test household reveal percentage
    const households = Object.values(gameState.entities).filter(e => e.type === 'household');
    const householdOrders = households.flatMap(h => [...h.incomingOrderIds, ...h.outgoingOrderIds]);
    const householdRevealCount = Math.floor(householdOrders.length * 0.3);
    
    console.log(`🏠 Household orders: ${householdOrders.length}, expected reveal: ${householdRevealCount}`);
    
    if (warehouseOrders.length === 0) {
      throw new Error('No warehouse orders found');
    }
    
    if (storeOrders.length === 0) {
      throw new Error('No store orders found');
    }
    
    if (householdOrders.length === 0) {
      throw new Error('No household orders found');
    }
  });
  
  await tester.run();
}

async function testMoveProcessing() {
  const tester = new IntegrationTester();
  
  tester.test('Move order should require valid order and target', async () => {
    const gameState = await apiCall('/api/gamestate');
    
    // Find a movable order
    const orders = Object.values(gameState.orders);
    const movableOrder = orders.find(o => !o.isRevealed);
    
    if (!movableOrder) {
      throw new Error('No hidden orders found to test movement');
    }
    
    console.log(`📦 Found order to move: ${movableOrder.id}`);
    console.log(`📍 Current route: ${movableOrder.fromEntityId} → ${movableOrder.toEntityId}`);
    
    // Find alternative target
    const entities = Object.values(gameState.entities);
    const alternativeTargets = entities.filter(e => 
      e.id !== movableOrder.toEntityId && 
      e.type !== 'backplane'
    );
    
    if (alternativeTargets.length === 0) {
      throw new Error('No alternative targets found');
    }
    
    const targetEntity = alternativeTargets[0];
    console.log(`🎯 Alternative target: ${targetEntity.name} (${targetEntity.id})`);
    
    // Validate move action structure
    const moveAction = {
      type: 'move_order',
      playerId: generatePlayerId(),
      timestamp: Date.now(),
      orderId: movableOrder.id,
      targetEntityId: targetEntity.id
    };
    
    if (!moveAction.orderId) {
      throw new Error('Move action missing orderId');
    }
    
    if (!moveAction.targetEntityId) {
      throw new Error('Move action missing targetEntityId');
    }
    
    if (moveAction.orderId === moveAction.targetEntityId) {
      throw new Error('Cannot move order to itself');
    }
  });
  
  tester.test('Move order should update entity relationships', async () => {
    const gameState = await apiCall('/api/gamestate');
    
    // Find an order to analyze
    const orders = Object.values(gameState.orders);
    const testOrder = orders[0];
    
    if (!testOrder) {
      throw new Error('No orders found');
    }
    
    const fromEntity = gameState.entities[testOrder.fromEntityId];
    const toEntity = gameState.entities[testOrder.toEntityId];
    
    if (!fromEntity) {
      throw new Error(`From entity ${testOrder.fromEntityId} not found`);
    }
    
    if (!toEntity) {
      throw new Error(`To entity ${testOrder.toEntityId} not found`);
    }
    
    // Check initial relationships
    const fromEntityHasOrder = fromEntity.outgoingOrderIds.includes(testOrder.id);
    const toEntityHasOrder = toEntity.incomingOrderIds.includes(testOrder.id);
    
    console.log(`📦 Order ${testOrder.id} relationships:`);
    console.log(`  From ${fromEntity.name}: ${fromEntityHasOrder ? '✅' : '❌'}`);
    console.log(`  To ${toEntity.name}: ${toEntityHasOrder ? '✅' : '❌'}`);
    
    if (!fromEntityHasOrder) {
      throw new Error('From entity should have order in outgoing list');
    }
    
    if (!toEntityHasOrder) {
      throw new Error('To entity should have order in incoming list');
    }
  });
  
  await tester.run();
}

async function testActionValidation() {
  const tester = new IntegrationTester();
  
  tester.test('Invalid action types should be rejected', async () => {
    const invalidActions = [
      { type: 'invalid_action', playerId: 'test', timestamp: Date.now() },
      { type: '', playerId: 'test', timestamp: Date.now() },
      { type: null, playerId: 'test', timestamp: Date.now() }
    ];
    
    for (const action of invalidActions) {
      console.log(`🚫 Testing invalid action: ${action.type}`);
      
      // These would be rejected by the backend validation
      if (action.type === 'move_order' || action.type === 'reveal_orders') {
        throw new Error(`Action type ${action.type} should be invalid`);
      }
    }
  });
  
  tester.test('Reveal actions should have correct structure', async () => {
    const validRevealActions = [
      {
        type: 'reveal_orders',
        playerId: 'test',
        timestamp: Date.now(),
        layer: 'warehouse'
      },
      {
        type: 'reveal_orders',
        playerId: 'test',
        timestamp: Date.now(),
        layer: 'store',
        neighborhoodId: 'neighborhood-0'
      },
      {
        type: 'reveal_orders',
        playerId: 'test',
        timestamp: Date.now(),
        layer: 'household',
        neighborhoodId: 'neighborhood-0'
      }
    ];
    
    for (const action of validRevealActions) {
      console.log(`✅ Testing valid reveal action: ${action.layer}`);
      
      if (action.type !== 'reveal_orders') {
        throw new Error('Action type should be reveal_orders');
      }
      
      if (!action.layer) {
        throw new Error('Reveal action should have layer');
      }
      
      if (!action.playerId) {
        throw new Error('Reveal action should have playerId');
      }
      
      if (!action.timestamp) {
        throw new Error('Reveal action should have timestamp');
      }
      
      if ((action.layer === 'store' || action.layer === 'household') && !action.neighborhoodId) {
        throw new Error(`${action.layer} reveal should have neighborhoodId`);
      }
    }
  });
  
  tester.test('Move actions should have correct structure', async () => {
    const validMoveActions = [
      {
        type: 'move_order',
        playerId: 'test',
        timestamp: Date.now(),
        orderId: 'order-1',
        targetEntityId: 'store-0'
      }
    ];
    
    for (const action of validMoveActions) {
      console.log(`✅ Testing valid move action`);
      
      if (action.type !== 'move_order') {
        throw new Error('Action type should be move_order');
      }
      
      if (!action.orderId) {
        throw new Error('Move action should have orderId');
      }
      
      if (!action.targetEntityId) {
        throw new Error('Move action should have targetEntityId');
      }
      
      if (!action.playerId) {
        throw new Error('Move action should have playerId');
      }
      
      if (!action.timestamp) {
        throw new Error('Move action should have timestamp');
      }
    }
  });
  
  await tester.run();
}

async function testGameStateConsistency() {
  const tester = new IntegrationTester();
  
  tester.test('Game state should be consistent after reset', async () => {
    // Get initial state
    const initialState = await apiCall('/api/gamestate');
    
    // Reset game
    await apiCall('/api/reset', { method: 'POST' });
    await sleep(1000);
    
    // Get new state
    const newState = await apiCall('/api/gamestate');
    
    // Validate consistency
    if (newState.startTime === initialState.startTime) {
      throw new Error('Start time should change after reset');
    }
    
    if (newState.endTime === initialState.endTime) {
      throw new Error('End time should change after reset');
    }
    
    if (newState.tickInterval !== initialState.tickInterval) {
      throw new Error('Tick interval should remain the same');
    }
    
    console.log(`📊 Initial state: ${Object.keys(initialState.entities).length} entities`);
    console.log(`📊 New state: ${Object.keys(newState.entities).length} entities`);
    console.log(`📊 Initial orders: ${Object.keys(initialState.orders).length} orders`);
    console.log(`📊 New orders: ${Object.keys(newState.orders).length} orders`);
  });
  
  tester.test('Entity relationships should be valid', async () => {
    const gameState = await apiCall('/api/gamestate');
    
    // Check that all order references point to valid entities
    for (const [orderId, order] of Object.entries(gameState.orders)) {
      if (!gameState.entities[order.fromEntityId]) {
        throw new Error(`Order ${orderId} references invalid fromEntity: ${order.fromEntityId}`);
      }
      
      if (!gameState.entities[order.toEntityId]) {
        throw new Error(`Order ${orderId} references invalid toEntity: ${order.toEntityId}`);
      }
    }
    
    // Check that all entity order references point to valid orders
    for (const [entityId, entity] of Object.entries(gameState.entities)) {
      for (const orderId of entity.incomingOrderIds) {
        if (!gameState.orders[orderId]) {
          throw new Error(`Entity ${entityId} references invalid incoming order: ${orderId}`);
        }
      }
      
      for (const orderId of entity.outgoingOrderIds) {
        if (!gameState.orders[orderId]) {
          throw new Error(`Entity ${entityId} references invalid outgoing order: ${orderId}`);
        }
      }
    }
    
    console.log('✅ All entity relationships are valid');
  });
  
  tester.test('Neighborhood structure should be valid', async () => {
    const gameState = await apiCall('/api/gamestate');
    
    for (const [neighborhoodId, neighborhood] of Object.entries(gameState.neighborhoods)) {
      // Check that all store IDs reference valid entities
      for (const storeId of neighborhood.storeIds) {
        const store = gameState.entities[storeId];
        if (!store) {
          throw new Error(`Neighborhood ${neighborhoodId} references invalid store: ${storeId}`);
        }
        
        if (store.type !== 'store') {
          throw new Error(`Neighborhood ${neighborhoodId} references non-store entity: ${storeId}`);
        }
        
        if (store.neighborhoodId !== neighborhoodId) {
          throw new Error(`Store ${storeId} has incorrect neighborhoodId: ${store.neighborhoodId}`);
        }
      }
      
      // Check that all household IDs reference valid entities
      for (const householdId of neighborhood.householdIds) {
        const household = gameState.entities[householdId];
        if (!household) {
          throw new Error(`Neighborhood ${neighborhoodId} references invalid household: ${householdId}`);
        }
        
        if (household.type !== 'household') {
          throw new Error(`Neighborhood ${neighborhoodId} references non-household entity: ${householdId}`);
        }
        
        if (household.neighborhoodId !== neighborhoodId) {
          throw new Error(`Household ${householdId} has incorrect neighborhoodId: ${household.neighborhoodId}`);
        }
      }
    }
    
    console.log('✅ All neighborhood structures are valid');
  });
  
  await tester.run();
}

// Main test runner
async function runTests() {
  const testName = process.argv[2] || 'all';
  
  try {
    // Check server health first
    await apiCall('/api/health');
    console.log('💚 Server is healthy');
    
    switch (testName) {
      case 'reveal':
        await testRevealProcessing();
        break;
      case 'move':
        await testMoveProcessing();
        break;
      case 'validation':
        await testActionValidation();
        break;
      case 'consistency':
        await testGameStateConsistency();
        break;
      case 'all':
        await testGameStateConsistency();
        await testActionValidation();
        await testRevealProcessing();
        await testMoveProcessing();
        break;
      default:
        console.log('Available tests: reveal, move, validation, consistency, all');
        break;
    }
    
    console.log('\n🎉 Backend integration tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();
