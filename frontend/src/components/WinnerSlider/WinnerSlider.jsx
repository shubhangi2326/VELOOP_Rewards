import React, { useEffect, useState } from 'react';
import { PartyPopper, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const WinnerSlider = () => {
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setLoading(true); setError(false);
      try {
        const data = await api.getPreviousWinners();
        if (ignore) return;
        if (data?.length > 0) {
          const ids = [...new Set(data.map(w => w.giveawayId))];
          const giveaways = await Promise.all(ids.map(id => api.getGiveawayById(id).catch(() => null)));
          if (ignore) return;
          const map = {};
          giveaways.forEach(g => { if (g) map[g.id] = g; });
          const seen = new Set();
          const formatted = [];
          data.forEach(w => {
            if (!seen.has(w._id)) {
              seen.add(w._id);
              const g = map[w.giveawayId];
              let prize = g?.prizes?.find(p => p.id === w.prizeId);
              if (!prize && g?.prizes?.length === 1) {
                prize = g.prizes[0];
              }
              const prizeName = w.prizeName || prize?.name || 'a prize';
              const prizeImage = w.prizeImage || prize?.image || null;
              formatted.push({ id: w._id, maskedUserId: w.maskedUserId, prizeName, giveawayName: g?.title || 'Unknown Giveaway', prizeImage });
            }
          });
          setWinners([...formatted, ...formatted]);
        } else setWinners([]);
      } catch { if (!ignore) setError(true); }
      finally { if (!ignore) setLoading(false); }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  if (loading) return null;

  if (error) return (
    <div className="winner-slider-container" style={{ justifyContent: 'center', padding: '1rem' }}>
      <AlertCircle size={16} style={{ color: '#ef4444', marginRight: '0.5rem' }} />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Failed to load winners</span>
    </div>
  );

  if (winners.length === 0) return (
    <div className="winner-slider-container" style={{ justifyContent: 'center', padding: '1rem' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No winners have been announced yet.</span>
    </div>
  );

  return (
    <div className="winner-slider-container">
      <div className="winner-slider-label">
        <PartyPopper size={18} /><span>Recent Winners</span>
      </div>
      <div className="winner-slider-track-wrapper">
        <div className="winner-slider-track">
          {winners.map((w, idx) => (
            <div key={`${w.id}-${idx}`} className="winner-card-tick">
              {w.prizeImage && <img src={w.prizeImage} alt={w.prizeName} className="winner-tick-img" />}
              <div>
                <div className="winner-tick-user">{w.maskedUserId} won!</div>
                <div className="winner-tick-prize">{w.prizeName}</div>
                <div className="winner-tick-giveaway">in {w.giveawayName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnerSlider;
