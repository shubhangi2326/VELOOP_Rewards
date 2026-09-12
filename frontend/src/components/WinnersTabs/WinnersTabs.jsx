import React, { useState } from 'react';
import { MOCK_PREVIOUS_WINNERS } from '../../data/mockData';
import styles from './WinnersTabs.module.css';

const WinnersTabs = ({ activeGiveaway }) => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeader}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'current' ? styles.active : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Giveaway
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'previous' ? styles.active : ''}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Winners
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'current' ? (
          <div className={styles.emptyState}>
            <h5>{activeGiveaway ? 'Giveaway is still live' : 'The next giveaway is being prepared'}</h5>
            <p className="text-muted">
              {activeGiveaway ? 'Winners will be announced after the giveaway ends.' : 'Stay tuned for more rewards.'}
            </p>
          </div>
        ) : (
          <div className={styles.winnersList}>
            {MOCK_PREVIOUS_WINNERS.map(winner => (
              <div key={winner.id} className={styles.winnerCard}>
                <div className={styles.winnerInfo}>
                  <div className={styles.avatar}>{winner.maskedUserId.substring(0, 2)}</div>
                  <div>
                    <h6 className="mb-0">{winner.maskedUserId}</h6>
                    <small className="text-muted">Won: {winner.prize}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div className={styles.giveawayName}>{winner.giveaway}</div>
                  <small className="text-muted">{winner.date}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WinnersTabs;
