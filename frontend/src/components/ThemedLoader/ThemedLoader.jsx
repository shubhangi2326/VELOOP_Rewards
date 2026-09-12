import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import styles from './ThemedLoader.module.css';

const MESSAGES = [
  "Preparing today's rewards...",
  "Checking active giveaways...",
  "Loading available prizes...",
  "Bringing your rewards closer..."
];

const ThemedLoader = ({ fullScreen = false }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.iconWrapper}>
        <Gift size={48} className={styles.giftIcon} />
        <div className={styles.sparkles}>
          <div className={`${styles.sparkle} ${styles.s1}`}></div>
          <div className={`${styles.sparkle} ${styles.s2}`}></div>
          <div className={`${styles.sparkle} ${styles.s3}`}></div>
        </div>
      </div>
      <div className={styles.textContainer}>
        <h4 className="text-gradient mb-1">REWARD UNLOCKING</h4>
        <p className={styles.messageText}>{MESSAGES[messageIndex]}</p>
        <div className={styles.progressDots}>
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
};

export default ThemedLoader;
