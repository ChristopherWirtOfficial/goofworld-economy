import { useAtomValue } from 'jotai';
import { 
  gameStateAtom, 
  revealedOrdersAtom, 
  ordersByEntityAtom, 
  entityDetailsAtom,
  isActionAllowedAtom 
} from '@/store/atoms';
import { Order, Entity } from '@/shared/types';

export function useGameState() {
  const gameState = useAtomValue(gameStateAtom);
  const revealedOrders = useAtomValue(revealedOrdersAtom);
  const ordersByEntity = useAtomValue(ordersByEntityAtom);
  const entityDetails = useAtomValue(entityDetailsAtom);
  const isActionAllowed = useAtomValue(isActionAllowedAtom);

  const getEntityDetails = (entityId: string) => {
    return entityDetails[entityId] || null;
  };

  const getRevealedOrdersForEntity = (entityId: string) => {
    return ordersByEntity[entityId] || { incoming: [], outgoing: [] };
  };

  const getRevealedOrdersByLayer = (layer: 'warehouse' | 'store' | 'household') => {
    return revealedOrders.filter(order => order.revealSource === layer);
  };

  const getRevealedOrdersByEntityType = (entityType: 'warehouse' | 'store' | 'household') => {
    if (!gameState) return [];
    
    const entities = Object.values(gameState.entities).filter(e => e.type === entityType);
    const entityIds = entities.map(e => e.id);
    
    return revealedOrders.filter(order => 
      entityIds.includes(order.fromEntityId) || entityIds.includes(order.toEntityId)
    );
  };

  const getOrderDetails = (orderId: string) => {
    if (!gameState) return null;
    return gameState.orders[orderId] || null;
  };

  const getEntityById = (entityId: string) => {
    if (!gameState) return null;
    return gameState.entities[entityId] || null;
  };

  const getNeighborhoodById = (neighborhoodId: string) => {
    if (!gameState) return null;
    return gameState.neighborhoods?.[neighborhoodId] || null;
  };

  const getOrdersInNeighborhood = (neighborhoodId: string) => {
    const neighborhood = getNeighborhoodById(neighborhoodId);
    if (!neighborhood) return [];

    const neighborhoodEntityIds = [...neighborhood.storeIds, ...neighborhood.householdIds];
    return revealedOrders.filter(order => 
      neighborhoodEntityIds.includes(order.fromEntityId) || 
      neighborhoodEntityIds.includes(order.toEntityId)
    );
  };

  return {
    gameState,
    revealedOrders,
    ordersByEntity,
    entityDetails,
    isActionAllowed,
    getEntityDetails,
    getRevealedOrdersForEntity,
    getRevealedOrdersByLayer,
    getRevealedOrdersByEntityType,
    getOrderDetails,
    getEntityById,
    getNeighborhoodById,
    getOrdersInNeighborhood,
  };
}
