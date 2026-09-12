import React from 'react';
import { Trophy, Calendar } from 'lucide-react';
import styles from './WinnerCard.module.css';

const WinnerCard = ({ winner, prize }) => {
  const winnerDate = new Date(winner.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {prize?.image ? (
          <img src={prize.image} alt={prize.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Trophy size={48} className="text-muted" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.winnerBadge}>
          <Trophy size={14} className="me-1" aria-hidden="true" /> Winner
        </div>
        <h3 className={styles.userId}>{winner.maskedUserId}</h3>
        <p className={styles.prizeName}>Won: <strong>{prize?.name || 'Unknown Prize'}</strong></p>
        <div className={styles.dateInfo}>
          <Calendar size={14} className="me-1" aria-hidden="true" />
          <span>{winnerDate}</span>
        </div>
      </div>
    </div>
  );
};

export default WinnerCard;
