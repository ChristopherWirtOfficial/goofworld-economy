import { GameState, Order, Neighborhood } from '@/shared/types';

const NEIGHBORHOOD_NAMES = ['Downtown', 'Westside', 'Northbrook', 'Riverside'];

function createMockGameState(): GameState {
  const entities: GameState['entities'] = {};
  const orders: GameState['orders'] = {};
  const neighborhoods: GameState['neighborhoods'] = {};
  let orderId = 0;

  // Create backplane
  entities['backplane-0'] = {
    id: 'backplane-0',
    name: 'Import Depot',
    type: 'backplane',
    inventory: {},
    capacity: 1000000,
    incomingOrderIds: [],
    outgoingOrderIds: [],
  };

  // Create warehouses (global - not part of neighborhoods)
  const warehouseIds = ['warehouse-0', 'warehouse-1', 'warehouse-2', 'warehouse-3'];
  warehouseIds.forEach((id, i) => {
    entities[id] = {
      id,
      name: `Warehouse ${i + 1}`,
      type: 'warehouse',
      inventory: {},
      capacity: 100000,
      incomingOrderIds: [],
      outgoingOrderIds: [],
    };
  });

  // Create neighborhoods
  const numNeighborhoods = 4;
  const storesPerNeighborhood = 5;
  const householdsPerNeighborhood = 50;

  for (let n = 0; n < numNeighborhoods; n++) {
    const neighborhoodId = `neighborhood-${n}`;
    neighborhoods[neighborhoodId] = {
      id: neighborhoodId,
      name: NEIGHBORHOOD_NAMES[n],
      storeIds: [],
      householdIds: [],
    };

    // Create stores for this neighborhood
    for (let s = 0; s < storesPerNeighborhood; s++) {
      const storeIndex = n * storesPerNeighborhood + s;
      const storeId = `store-${storeIndex}`;
      
      entities[storeId] = {
        id: storeId,
        name: `Store ${storeIndex + 1}`,
        type: 'store',
        inventory: {},
        capacity: 10000,
        incomingOrderIds: [],
        outgoingOrderIds: [],
        neighborhoodId,
      };
      
      neighborhoods[neighborhoodId].storeIds.push(storeId);

      // Each store gets supply from exactly 1 warehouse (round-robin)
      const warehouseId = warehouseIds[storeIndex % warehouseIds.length];

      const order: Order = {
        id: `order-${orderId++}`,
        item: 'goods',
        quantity: Math.floor(Math.random() * 5000) + 1000,
        fromEntityId: warehouseId,
        toEntityId: storeId,
        isRevealed: false,
      };
      orders[order.id] = order;
      entities[warehouseId].outgoingOrderIds.push(order.id);
      entities[storeId].incomingOrderIds.push(order.id);
    }

    // Create households for this neighborhood
    for (let h = 0; h < householdsPerNeighborhood; h++) {
      const householdIndex = n * householdsPerNeighborhood + h;
      const householdId = `household-${householdIndex}`;
      
      entities[householdId] = {
        id: householdId,
        name: `Household ${householdIndex + 1}`,
        type: 'household',
        inventory: {},
        capacity: 1000,
        incomingOrderIds: [],
        outgoingOrderIds: [],
        neighborhoodId,
      };
      
      neighborhoods[neighborhoodId].householdIds.push(householdId);

      // Each household orders from exactly 1 store in the same neighborhood
      const storeIndexInNeighborhood = h % storesPerNeighborhood;
      const storeId = neighborhoods[neighborhoodId].storeIds[storeIndexInNeighborhood];

      const order: Order = {
        id: `order-${orderId++}`,
        item: 'goods',
        quantity: Math.floor(Math.random() * 50) + 10,
        fromEntityId: storeId,
        toEntityId: householdId,
        isRevealed: false,
      };
      orders[order.id] = order;
      entities[storeId].outgoingOrderIds.push(order.id);
      entities[householdId].incomingOrderIds.push(order.id);
    }
  }

  return {
    entities,
    orders,
    neighborhoods,
    startTime: Date.now(),
    endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
    tickInterval: 5 * 60 * 1000,
  };
}

export const mockGameState: GameState = createMockGameState();

