import React from 'react';
import { Search, CheckSquare, Wallet, ShieldCheck, Clock, PartyPopper, Gift } from 'lucide-react';
import styles from './HowThisGiveawayWorks.module.css';

const IconMap = {
  Search,
  CheckSquare,
  Wallet,
  ShieldCheck,
  Clock,
  PartyPopper,
  Gift
};

const HowThisGiveawayWorks = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className={styles.timelineContainer}>
      <h3 className={styles.title}>How This Giveaway Works</h3>
      <div className={styles.timeline}>
        {timeline.map((item, idx) => {
          const Icon = IconMap[item.icon] || ShieldCheck;
          return (
            <div key={idx} className={styles.timelineItem}>
              <div className={styles.iconContainer}>
                <div className={styles.iconWrapper}>
                  <Icon size={20} className={styles.icon} aria-hidden="true" />
                </div>
                {idx < timeline.length - 1 && <div className={styles.line}></div>}
              </div>
              <div className={styles.content}>
                <h4 className={styles.stepTitle}>{item.title}</h4>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowThisGiveawayWorks;
