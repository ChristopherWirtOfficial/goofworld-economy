import { useGameStore } from '@/store/gameStore';
import styles from './GameView.module.css';

export default function GameView() {
  const { gameState } = useGameStore();

  if (!gameState) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Connecting to Goof World...</p>
      </div>
    );
  }

  const entities = Object.values(gameState.entities);
  const warehouses = entities.filter(e => e.type === 'warehouse');
  const stores = entities.filter(e => e.type === 'store');
  const households = entities.filter(e => e.type === 'household');

  const totalOrders = Object.keys(gameState.orders).length;
  const revealedOrders = Object.values(gameState.orders).filter(o => o.isRevealed).length;

  return (
    <div className={styles.container}>
      <div className={styles.overview}>
        <h2>System Overview</h2>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{warehouses.length}</span>
            <span className={styles.metricLabel}>Warehouses</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{stores.length}</span>
            <span className={styles.metricLabel}>Stores</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{households.length}</span>
            <span className={styles.metricLabel}>Households</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{totalOrders}</span>
            <span className={styles.metricLabel}>Total Orders</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue} style={{ color: '#51cf66' }}>{revealedOrders}</span>
            <span className={styles.metricLabel}>Revealed Orders</span>
          </div>
        </div>
      </div>

      <div className={styles.visualization}>
        <p className={styles.placeholder}>
          Visualization coming soon...
          <br />
          <small>This is where the interactive town view will go</small>
        </p>
      </div>
    </div>
  );
}
