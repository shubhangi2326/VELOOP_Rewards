import React, { useState, useEffect, useCallback } from 'react';
import styles from './Countdown.module.css';
import { Clock } from 'lucide-react';

const getRemainingTime = (targetDate) => {
  const difference = new Date(targetDate) - new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

const Countdown = ({ targetDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getRemainingTime(targetDate);
      setTimeLeft(newTime);
      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        clearInterval(timer);
        if (onEnd) onEnd();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onEnd]);

  const addZero = (num) => String(num).padStart(2, '0');

  const isEnded = Object.values(timeLeft).every(val => val === 0);

  if (isEnded) {
    return (
      <div className={styles.endedContainer}>
        <span className={styles.endedText}>GIVEAWAY ENDED</span>
      </div>
    );
  }

  return (
    <div className={styles.countdownContainer}>
      <div className={styles.header}>
        <Clock size={16} />
        <span>Ends In</span>
      </div>
      <div className={styles.timeBlocks}>
        <div className={styles.timeBlock}>
          <span className={styles.value}>{addZero(timeLeft.days)}</span>
          <span className={styles.label}>d</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.timeBlock}>
          <span className={styles.value}>{addZero(timeLeft.hours)}</span>
          <span className={styles.label}>h</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.timeBlock}>
          <span className={styles.value}>{addZero(timeLeft.minutes)}</span>
          <span className={styles.label}>m</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.timeBlock}>
          <span className={styles.value}>{addZero(timeLeft.seconds)}</span>
          <span className={styles.label}>s</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
