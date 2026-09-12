import React from 'react';
import styles from './GiveawayStats.module.css';
import { Trophy, Users, Gift, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const GiveawayStats = ({ stats }) => {
  const statItems = [
    { id: 1, label: 'Total Giveaways', value: stats?.totalGiveaways || '—', icon: <Gift size={24} />, color: 'var(--primary-color)' },
    { id: 2, label: 'Total Participants', value: stats?.participants || '—', icon: <Users size={24} />, color: 'var(--accent-gold)' },
    { id: 3, label: 'Prizes Won', value: stats?.prizesWon || '—', icon: <Trophy size={24} />, color: 'var(--accent-green)' },
    { id: 4, label: 'Next Ends In', value: stats?.nextEndsIn || '—', icon: <Clock size={24} />, color: '#ef4444' }
  ];

  return (
    <div className={styles.statsContainer}>
      <div className="container">
        <div className="row g-4">
          {statItems.map((stat, index) => (
            <div key={stat.id} className="col-6 col-md-3">
              <motion.div 
                className={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={styles.iconWrapper} style={{ color: stat.color, background: `${stat.color}15` }}>
                  {stat.icon}
                </div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiveawayStats;
