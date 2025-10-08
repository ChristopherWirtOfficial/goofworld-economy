import Database from 'better-sqlite3';
import { GameState, Entity, Order, Neighborhood } from '../../shared/types';

export class GameStateRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Load full game state from database
  loadGameState(): GameState | null {
    try {
      const metadata = this.db.prepare('SELECT * FROM game_metadata WHERE id = 1').get() as any;
      
      if (!metadata) {
        return null;
      }

      const entities: Record<string, Entity> = {};
      const orders: Record<string, Order> = {};
      const neighborhoods: Record<string, Neighborhood> = {};

      // Load neighborhoods
      const neighborhoodRows = this.db.prepare('SELECT * FROM neighborhoods').all() as any[];
      for (const row of neighborhoodRows) {
        neighborhoods[row.id] = {
          id: row.id,
          name: row.name,
          storeIds: [],
          householdIds: [],
        };
      }

      // Load entities
      const entityRows = this.db.prepare('SELECT * FROM entities').all() as any[];
      for (const row of entityRows) {
        const entity: Entity = {
          id: row.id,
          name: row.name,
          type: row.type,
          inventory: JSON.parse(row.inventory_json),
          capacity: row.capacity,
          incomingOrderIds: [],
          outgoingOrderIds: [],
          neighborhoodId: row.neighborhood_id || undefined,
        };
        entities[entity.id] = entity;

        // Add to neighborhood
        if (entity.neighborhoodId && neighborhoods[entity.neighborhoodId]) {
          if (entity.type === 'store') {
            neighborhoods[entity.neighborhoodId].storeIds.push(entity.id);
          } else if (entity.type === 'household') {
            neighborhoods[entity.neighborhoodId].householdIds.push(entity.id);
          }
        }
      }

      // Load orders and populate entity order arrays
      const orderRows = this.db.prepare('SELECT * FROM orders').all() as any[];
      for (const row of orderRows) {
        const order: Order = {
          id: row.id,
          item: row.item,
          quantity: row.quantity,
          fromEntityId: row.from_entity_id,
          toEntityId: row.to_entity_id,
          isRevealed: row.is_revealed === 1,
          revealedUntil: row.revealed_until || undefined,
          revealSource: row.reveal_source || undefined,
        };
        orders[order.id] = order;

        // Populate entity order arrays
        if (entities[order.fromEntityId]) {
          entities[order.fromEntityId].outgoingOrderIds.push(order.id);
        }
        if (entities[order.toEntityId]) {
          entities[order.toEntityId].incomingOrderIds.push(order.id);
        }
      }

      return {
        entities,
        orders,
        neighborhoods,
        startTime: metadata.start_time,
        endTime: metadata.end_time,
        tickInterval: metadata.tick_interval,
      };
    } catch (error) {
      console.error('Failed to load game state from database:', error);
      return null;
    }
  }

  // Save full game state to database
  saveGameState(gameState: GameState): void {
    const saveTransaction = this.db.transaction(() => {
      const now = Date.now();

      // Save metadata
      this.db.prepare(`
        INSERT OR REPLACE INTO game_metadata (id, start_time, end_time, tick_interval, created_at, updated_at)
        VALUES (1, ?, ?, ?, ?, ?)
      `).run(gameState.startTime, gameState.endTime, gameState.tickInterval, now, now);

      // Clear existing data
      this.db.prepare('DELETE FROM orders').run();
      this.db.prepare('DELETE FROM entities').run();
      this.db.prepare('DELETE FROM neighborhoods').run();

      // Save neighborhoods
      const insertNeighborhood = this.db.prepare(`
        INSERT INTO neighborhoods (id, name, created_at)
        VALUES (?, ?, ?)
      `);
      for (const neighborhood of Object.values(gameState.neighborhoods)) {
        insertNeighborhood.run(neighborhood.id, neighborhood.name, now);
      }

      // Save entities
      const insertEntity = this.db.prepare(`
        INSERT INTO entities (id, name, type, inventory_json, capacity, neighborhood_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const entity of Object.values(gameState.entities)) {
        insertEntity.run(
          entity.id,
          entity.name,
          entity.type,
          JSON.stringify(entity.inventory),
          entity.capacity,
          entity.neighborhoodId || null,
          now
        );
      }

      // Save orders
      const insertOrder = this.db.prepare(`
        INSERT INTO orders (id, item, quantity, from_entity_id, to_entity_id, is_revealed, revealed_until, reveal_source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const order of Object.values(gameState.orders)) {
        insertOrder.run(
          order.id,
          order.item,
          order.quantity,
          order.fromEntityId,
          order.toEntityId,
          order.isRevealed ? 1 : 0,
          order.revealedUntil || null,
          order.revealSource || null,
          now,
          now
        );
      }
    });

    saveTransaction();
    console.log('Game state saved to database');
  }

  // Update specific orders (optimized for reveal/move operations)
  updateOrders(orders: Order[]): void {
    const updateTransaction = this.db.transaction(() => {
      const now = Date.now();
      const updateOrder = this.db.prepare(`
        UPDATE orders 
        SET from_entity_id = ?, to_entity_id = ?, is_revealed = ?, revealed_until = ?, reveal_source = ?, updated_at = ?
        WHERE id = ?
      `);

      for (const order of orders) {
        updateOrder.run(
          order.fromEntityId,
          order.toEntityId,
          order.isRevealed ? 1 : 0,
          order.revealedUntil || null,
          order.revealSource || null,
          now,
          order.id
        );
      }
    });

    updateTransaction();
  }

  // Log player action
  logPlayerAction(playerId: string, actionType: string, actionData: any): void {
    const now = Date.now();
    this.db.prepare(`
      INSERT INTO player_actions (player_id, action_type, action_data_json, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(playerId, actionType, JSON.stringify(actionData), actionData.timestamp || now, now);
  }

  // Get player action history
  getPlayerActions(playerId?: string, limit: number = 100): any[] {
    if (playerId) {
      return this.db.prepare(`
        SELECT * FROM player_actions 
        WHERE player_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(playerId, limit);
    } else {
      return this.db.prepare(`
        SELECT * FROM player_actions 
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(limit);
    }
  }

  // Check if game state exists
  gameStateExists(): boolean {
    const result = this.db.prepare('SELECT COUNT(*) as count FROM game_metadata WHERE id = 1').get() as any;
    return result.count > 0;
  }
}

