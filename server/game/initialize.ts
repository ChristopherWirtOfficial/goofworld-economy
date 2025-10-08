import { GameState, Entity, Order, EntityType, Neighborhood } from '../../shared/types';

const ITEMS = ['potatoes', 'weed', 'bread', 'rice', 'eggs', 'milk', 'apples', 'chicken'];
const NEIGHBORHOOD_NAMES = ['Downtown', 'Westside', 'Northbrook', 'Riverside'];

export function initializeGameState(): GameState {
  const entities: Record<string, Entity> = {};
  const orders: Record<string, Order> = {};
  const neighborhoods: Record<string, Neighborhood> = {};

  // Create backplane (import layer)
  const backplane: Entity = {
    id: 'backplane-0',
    name: 'Import Depot',
    type: 'backplane',
    inventory: {},
    capacity: 1000000,
    incomingOrderIds: [],
    outgoingOrderIds: [],
  };
  entities[backplane.id] = backplane;

  // Create warehouses
  const warehouseCount = 4;
  const warehouses: Entity[] = [];
  for (let i = 0; i < warehouseCount; i++) {
    const warehouse: Entity = {
      id: `warehouse-${i}`,
      name: `Warehouse ${i + 1}`,
      type: 'warehouse',
      inventory: {},
      capacity: 100000,
      incomingOrderIds: [],
      outgoingOrderIds: [],
    };
    entities[warehouse.id] = warehouse;
    warehouses.push(warehouse);
  }

  // Create stores
  const storesPerWarehouse = 5;
  const stores: Entity[] = [];
  for (let i = 0; i < warehouseCount * storesPerWarehouse; i++) {
    const store: Entity = {
      id: `store-${i}`,
      name: `Store ${i + 1}`,
      type: 'store',
      inventory: {},
      capacity: 10000,
      incomingOrderIds: [],
      outgoingOrderIds: [],
    };
    entities[store.id] = store;
    stores.push(store);
  }

  // Create households
  const householdsPerStore = 10;
  const households: Entity[] = [];
  for (let i = 0; i < stores.length * householdsPerStore; i++) {
    const household: Entity = {
      id: `household-${i}`,
      name: `Household ${i + 1}`,
      type: 'household',
      inventory: {},
      capacity: 1000,
      incomingOrderIds: [],
      outgoingOrderIds: [],
    };
    entities[household.id] = household;
    households.push(household);
  }

  // Create orders - properly distributed then scrambled
  let orderId = 0;

  // Warehouse orders from backplane
  for (const warehouse of warehouses) {
    for (const item of ITEMS) {
      const quantity = Math.floor(Math.random() * 5000) + 10000; // 10k-15k pounds
      const order: Order = {
        id: `order-${orderId++}`,
        item,
        quantity,
        fromEntityId: backplane.id,
        toEntityId: warehouse.id,
        isRevealed: false,
      };
      orders[order.id] = order;
      backplane.outgoingOrderIds.push(order.id);
      warehouse.incomingOrderIds.push(order.id);
    }
  }

  // Store orders from warehouses
  for (let i = 0; i < stores.length; i++) {
    const store = stores[i];
    const warehouse = warehouses[Math.floor(i / storesPerWarehouse)];
    
    for (const item of ITEMS) {
      const quantity = Math.floor(Math.random() * 500) + 1000; // 1k-1.5k pounds
      const order: Order = {
        id: `order-${orderId++}`,
        item,
        quantity,
        fromEntityId: warehouse.id,
        toEntityId: store.id,
        isRevealed: false,
      };
      orders[order.id] = order;
      warehouse.outgoingOrderIds.push(order.id);
      store.incomingOrderIds.push(order.id);
    }
  }

  // Household orders from stores
  for (let i = 0; i < households.length; i++) {
    const household = households[i];
    const store = stores[Math.floor(i / householdsPerStore)];
    
    for (const item of ITEMS) {
      const quantity = Math.floor(Math.random() * 10) + 10; // 10-20 pounds
      const order: Order = {
        id: `order-${orderId++}`,
        item,
        quantity,
        fromEntityId: store.id,
        toEntityId: household.id,
        isRevealed: false,
      };
      orders[order.id] = order;
      store.outgoingOrderIds.push(order.id);
      household.incomingOrderIds.push(order.id);
    }
  }

  // CHAOS: Delete 50% of orders randomly
  const allOrderIds = Object.keys(orders);
  const ordersToDelete = Math.floor(allOrderIds.length * 0.5);
  const deletedOrderIds = new Set<string>();
  
  for (let i = 0; i < ordersToDelete; i++) {
    const randomIdx = Math.floor(Math.random() * allOrderIds.length);
    const orderIdToDelete = allOrderIds[randomIdx];
    
    if (!deletedOrderIds.has(orderIdToDelete)) {
      const order = orders[orderIdToDelete];
      
      // Remove from entities
      const fromEntity = entities[order.fromEntityId];
      const toEntity = entities[order.toEntityId];
      
      if (fromEntity) {
        fromEntity.outgoingOrderIds = fromEntity.outgoingOrderIds.filter(id => id !== orderIdToDelete);
      }
      if (toEntity) {
        toEntity.incomingOrderIds = toEntity.incomingOrderIds.filter(id => id !== orderIdToDelete);
      }
      
      delete orders[orderIdToDelete];
      deletedOrderIds.add(orderIdToDelete);
    }
  }

  // CHAOS: Scramble remaining orders (swap from/to entities randomly)
  const remainingOrderIds = Object.keys(orders);
  for (const orderId of remainingOrderIds) {
    if (Math.random() < 0.7) { // 70% chance to scramble each order
      const order = orders[orderId];
      const allEntityIds = Object.keys(entities).filter(id => id !== 'backplane-0');
      
      const randomFromIdx = Math.floor(Math.random() * allEntityIds.length);
      const randomToIdx = Math.floor(Math.random() * allEntityIds.length);
      
      // Remove from old entities
      const oldFrom = entities[order.fromEntityId];
      const oldTo = entities[order.toEntityId];
      if (oldFrom) {
        oldFrom.outgoingOrderIds = oldFrom.outgoingOrderIds.filter(id => id !== orderId);
      }
      if (oldTo) {
        oldTo.incomingOrderIds = oldTo.incomingOrderIds.filter(id => id !== orderId);
      }
      
      // Assign to new random entities
      order.fromEntityId = allEntityIds[randomFromIdx];
      order.toEntityId = allEntityIds[randomToIdx];
      
      // Add to new entities
      entities[order.fromEntityId].outgoingOrderIds.push(orderId);
      entities[order.toEntityId].incomingOrderIds.push(orderId);
    }
  }

  const now = Date.now();
  const twoMonthsMs = 60 * 24 * 60 * 60 * 1000; // 60 days

  // Create neighborhoods and assign entities to them
  const storesPerNeighborhood = 5;
  const householdsPerNeighborhood = 50;
  
  for (let n = 0; n < 4; n++) {
    const neighborhoodId = `neighborhood-${n}`;
    const neighborhoodStores = stores.slice(n * storesPerNeighborhood, (n + 1) * storesPerNeighborhood);
    const neighborhoodHouseholds = households.slice(n * householdsPerNeighborhood, (n + 1) * householdsPerNeighborhood);
    
    neighborhoods[neighborhoodId] = {
      id: neighborhoodId,
      name: NEIGHBORHOOD_NAMES[n],
      storeIds: neighborhoodStores.map(s => s.id),
      householdIds: neighborhoodHouseholds.map(h => h.id),
    };
    
    // Assign neighborhood IDs to stores and households
    for (const store of neighborhoodStores) {
      store.neighborhoodId = neighborhoodId;
    }
    for (const household of neighborhoodHouseholds) {
      household.neighborhoodId = neighborhoodId;
    }
  }

  return {
    entities,
    orders,
    neighborhoods,
    startTime: now,
    endTime: now + twoMonthsMs,
    tickInterval: 5 * 60 * 1000, // 5 minutes
  };
}
