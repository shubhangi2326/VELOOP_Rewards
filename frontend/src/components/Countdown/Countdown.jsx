import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const getRemainingTime = (targetDate) => {
  const diff = new Date(targetDate) - new Date();
  if (diff > 0) {
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

const Countdown = ({ targetDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const t = getRemainingTime(targetDate);
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        clearInterval(timer);
        if (onEnd) onEnd();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onEnd]);

  const pad = (n) => String(n).padStart(2, '0');
  const isEnded = Object.values(timeLeft).every(v => v === 0);

  if (isEnded) {
    return (
      <div className="countdown-ended">
        <Clock size={16} /> GIVEAWAY ENDED
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <div className="countdown-header">
        <Clock size={14} /><span>Ends In</span>
      </div>
      <div className="countdown-blocks">
        {[['Days', timeLeft.days], ['Hrs', timeLeft.hours], ['Min', timeLeft.minutes], ['Sec', timeLeft.seconds]].map(([unit, val], i) => (
          <React.Fragment key={unit}>
            {i > 0 && <span className="countdown-sep">:</span>}
            <div className="countdown-block">
              <span className="countdown-value">{pad(val)}</span>
              <span className="countdown-unit">{unit}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
