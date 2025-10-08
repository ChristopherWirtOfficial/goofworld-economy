# Database Architecture

## Overview

Goof World uses **SQLite** with `better-sqlite3` as its persistence layer. This provides:
- **Embedded database** (no separate service required)
- **ACID compliance** for concurrent player actions
- **WAL mode** for excellent concurrent read performance
- **Simple deployment** (single file database)
- **Easy backups** and recovery

## Database Schema

### Tables

#### `game_metadata`
Stores global game configuration
- `id` (PRIMARY KEY, always 1)
- `start_time` (INTEGER)
- `end_time` (INTEGER)
- `tick_interval` (INTEGER)
- `created_at` (INTEGER)
- `updated_at` (INTEGER)

#### `neighborhoods`
Stores neighborhood definitions
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT)
- `created_at` (INTEGER)

#### `entities`
Stores all game entities (backplane, warehouses, stores, households)
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT)
- `type` (TEXT) - 'backplane', 'warehouse', 'store', or 'household'
- `inventory_json` (TEXT) - JSON string of inventory
- `capacity` (INTEGER)
- `neighborhood_id` (TEXT, FOREIGN KEY)
- `created_at` (INTEGER)

**Indexes:**
- `idx_entities_type` on `type`
- `idx_entities_neighborhood` on `neighborhood_id`

#### `orders`
Stores all orders in the system
- `id` (TEXT PRIMARY KEY)
- `item` (TEXT)
- `quantity` (INTEGER)
- `from_entity_id` (TEXT, FOREIGN KEY)
- `to_entity_id` (TEXT, FOREIGN KEY)
- `is_revealed` (INTEGER) - 0 or 1 (boolean)
- `revealed_until` (INTEGER, nullable)
- `reveal_source` (TEXT, nullable) - 'warehouse', 'store', or 'household'
- `created_at` (INTEGER)
- `updated_at` (INTEGER)

**Indexes:**
- `idx_orders_from_entity` on `from_entity_id`
- `idx_orders_to_entity` on `to_entity_id`
- `idx_orders_is_revealed` on `is_revealed`

#### `player_actions`
Logs all player actions for analytics and replay
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `player_id` (TEXT)
- `action_type` (TEXT) - 'move_order' or 'reveal_orders'
- `action_data_json` (TEXT) - Full action data as JSON
- `timestamp` (INTEGER) - Action timestamp
- `created_at` (INTEGER) - Database insert time

**Indexes:**
- `idx_player_actions_player` on `player_id`
- `idx_player_actions_timestamp` on `timestamp`

## Implementation

### Core Files

- **`server/db/schema.ts`**: Database initialization and schema definition
- **`server/db/gameState.ts`**: GameStateRepository class for CRUD operations
- **`server/index.ts`**: Integration with Express server

### Key Features

1. **Automatic Initialization**: Creates database and tables on first run
2. **WAL Mode**: Enables concurrent reads while writing
3. **Transactional Writes**: All multi-record operations use transactions
4. **Action Logging**: Every player action is logged for analytics
5. **State Persistence**: Game state automatically saved on:
   - Player actions
   - Simulation ticks
   - Manual resets

### API Endpoints

- `GET /api/gamestate` - Returns current game state
- `GET /api/actions?playerId=X&limit=100` - Returns player action history
- `POST /api/reset` - Resets game state to new initialization
- `GET /api/health` - Health check

## Performance Considerations

### Read Performance
- **WAL mode** allows unlimited concurrent readers
- **Indexes** on frequently queried columns
- In-memory game state cache (loaded once at startup)

### Write Performance
- **Writes are infrequent**: Player actions (throttled by cooldown) + simulation ticks (every 5 min)
- **Transactions** ensure atomicity for complex operations
- **Full state saves** on each action (acceptable for this use case)

### Scalability
For 100-10,000 concurrent players:
- **Reads**: Served from in-memory game state
- **Writes**: SQLite handles ~50,000 writes/sec
- **Bottleneck**: WebSocket broadcast, not database

## Database Location

- **Path**: `data/game.db`
- **WAL file**: `data/game.db-wal`
- **Shared memory**: `data/game.db-shm`

## Backup Strategy

Simple file-based backups:
```bash
cp data/game.db data/backups/game-$(date +%Y%m%d-%H%M%S).db
```

## Future Enhancements

Potential improvements if needed:
- **Incremental saves**: Only save changed orders/entities
- **PostgreSQL migration**: If separate database service is preferred
- **Read replicas**: For analytics queries
- **Time-series optimization**: For player action history

