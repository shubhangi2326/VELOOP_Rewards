import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy } from 'lucide-react';
import Countdown from '../Countdown/Countdown';
import styles from './PrizeCard.module.css';

const PrizeCard = ({ prize, giveawayId, participantsCount, endDate, status }) => {
  return (
    <div className={styles.card}>
      <div className={styles.positionBadge}>
        <Trophy size={14} className={styles.trophyIcon} />
        {prize.position === 1 ? '1st Prize' : prize.position === 2 ? '2nd Prize' : prize.position === 3 ? '3rd Prize' : 'Lucky Draw'}
      </div>
      
      <div className={styles.imageWrapper}>
        {prize.image ? (
          <img src={prize.image} alt={prize.name} className={styles.image} />
        ) : (
          <div className={`${styles.image} d-flex align-items-center justify-content-center bg-dark bg-opacity-50`}>
            <Trophy size={48} className="text-muted opacity-50" />
          </div>
        )}
        {status === 'active' && endDate && (
          <div className={styles.countdownOverlay}>
            <Countdown targetDate={endDate} />
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{prize.name}</h3>
        <p className={styles.description}>{prize.description}</p>
        
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <Users size={14} />
            <span>{participantsCount}+ Participants</span>
          </div>
          <div className={styles.stat}>
            <Trophy size={14} />
            <span>{prize.winnerCount} {prize.winnerCount > 1 ? 'Winners' : 'Winner'}</span>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.entryRequirement}>
            <span className={styles.reqLabel}>Entry Fee</span>
            <span className={styles.reqValue}>{prize.entryFee} {prize.entryCurrency}</span>
          </div>
          
          <Link 
            to={status === 'ended' ? `/giveaways/${giveawayId}/winners` : `/giveaways/${giveawayId}/prize/${prize.id}`} 
            className={styles.joinBtn}
          >
            {status === 'active' ? (
              <>Join Now <ArrowRight size={16} /></>
            ) : status === 'ended' ? (
              'View Winners'
            ) : (
              'View Details'
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrizeCard;
