import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'game.db');

export function initializeDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_metadata (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      tick_interval INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS neighborhoods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      inventory_json TEXT NOT NULL DEFAULT '{}',
      capacity INTEGER NOT NULL,
      neighborhood_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      from_entity_id TEXT NOT NULL,
      to_entity_id TEXT NOT NULL,
      is_revealed INTEGER NOT NULL DEFAULT 0,
      revealed_until INTEGER,
      reveal_source TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (from_entity_id) REFERENCES entities(id),
      FOREIGN KEY (to_entity_id) REFERENCES entities(id)
    );

    CREATE TABLE IF NOT EXISTS player_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_data_json TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_entities_neighborhood ON entities(neighborhood_id);
    CREATE INDEX IF NOT EXISTS idx_orders_from_entity ON orders(from_entity_id);
    CREATE INDEX IF NOT EXISTS idx_orders_to_entity ON orders(to_entity_id);
    CREATE INDEX IF NOT EXISTS idx_orders_is_revealed ON orders(is_revealed);
    CREATE INDEX IF NOT EXISTS idx_player_actions_player ON player_actions(player_id);
    CREATE INDEX IF NOT EXISTS idx_player_actions_timestamp ON player_actions(timestamp);
  `);

  console.log('Database initialized at', DB_PATH);
  return db;
}

export function getDatabase(): Database.Database {
  return new Database(DB_PATH);
}

