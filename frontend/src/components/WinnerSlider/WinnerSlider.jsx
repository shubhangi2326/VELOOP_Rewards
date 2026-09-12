import React, { useEffect, useState, useRef } from 'react';
import { PartyPopper, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import styles from './WinnerSlider.module.css';

const WinnerSlider = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const fetchWinners = async () => {
      setLoading(true);
      setError(false);
      try {
        const winnersData = await api.getPreviousWinners();
        if (ignore) return;
        
        if (winnersData && winnersData.length > 0) {
          // Find unique giveaway IDs
          const uniqueGiveawayIds = [...new Set(winnersData.map(w => w.giveawayId))];
          
          // Fetch all related giveaways to resolve prize info
          const giveaways = await Promise.all(
            uniqueGiveawayIds.map(id => api.getGiveawayById(id).catch(() => null))
          );
          
          if (ignore) return;
          
          const giveawayMap = {};
          giveaways.forEach(g => {
            if (g) giveawayMap[g.id] = g;
          });

          // Format winner messages
          const formattedMsgs = winnersData.map(w => {
            const giveaway = giveawayMap[w.giveawayId];
            const prize = giveaway?.prizes?.find(p => p.id === w.prizeId);
            const prizeName = prize?.name || 'a prize';
            return `🎉 User ${w.maskedUserId} won ${prizeName}!`;
          });
          
          // Duplicate for continuous scroll effect
          setMessages([...formattedMsgs, ...formattedMsgs]);
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch winners:", err);
          setError(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    
    fetchWinners();
    return () => { ignore = true; };
  }, []);

  if (loading) return null; // Can render a mini skeleton here if needed, but null is fine to avoid UI jump

  if (error) {
    return (
      <div className={styles.sliderContainer}>
        <div className="d-flex align-items-center justify-content-center w-100 text-danger small">
          <AlertCircle size={14} className="me-2" /> Failed to load recent winners
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className="d-flex align-items-center justify-content-center w-100 text-muted small fst-italic">
          No winners have been announced yet.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabel}>
        <PartyPopper size={16} />
        <span>Recent Winners</span>
      </div>
      <div className={styles.sliderTrackWrapper}>
        <div className={styles.sliderTrack} ref={sliderRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={styles.sliderItem}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnerSlider;
