import { useGameStore } from '@/store/gameStore';
import styles from './Header.module.css';

export default function Header() {
  const { gameState, nextActionTime } = useGameStore();

  if (!gameState) return null;

  const now = Date.now();
  const timeRemaining = gameState.endTime - now;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const onCooldown = nextActionTime > now;
  const cooldownRemaining = onCooldown ? Math.ceil((nextActionTime - now) / 1000) : 0;
  const cooldownMinutes = Math.floor(cooldownRemaining / 60);
  const cooldownSeconds = cooldownRemaining % 60;

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>GOOF WORLD</h1>
        <p>Catastrophe has struck. Stabilize the economy.</p>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Time Remaining</span>
          <span className={styles.value}>{daysRemaining}d {hoursRemaining}h</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Next Turn</span>
          <span className={styles.value} style={{ color: onCooldown ? '#ff6b6b' : '#51cf66' }}>
            {onCooldown ? `${cooldownMinutes}:${cooldownSeconds.toString().padStart(2, '0')}` : 'Ready'}
          </span>
        </div>
      </div>
    </header>
  );
}
