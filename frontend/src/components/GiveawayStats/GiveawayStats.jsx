import React, { useState, useEffect } from 'react';
import { Trophy, Users, Gift, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const GiveawayStats = () => {
  const [stats, setStats] = useState({ totalGiveaways: '—', participants: '—', prizesWon: '—', liveNow: 0, nextEndsIn: null });
  const [countdown, setCountdown] = useState('—');

  useEffect(() => {
    let ignore = false;
    api.getStats().then(data => { if (!ignore) setStats(data); }).catch(() => {});
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!stats.nextEndsIn) { setCountdown('—'); return; }
    const target = new Date(stats.nextEndsIn).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stats.nextEndsIn]);

  const items = [
    { label: 'Total Giveaways',  value: stats.totalGiveaways, Icon: Gift,   color: 'var(--primary-color)', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Total Participants',value: stats.participants,   Icon: Users,  color: 'var(--accent-gold)',   bg: 'rgba(251,191,36,0.12)' },
    { label: 'Prizes Won',        value: stats.prizesWon,      Icon: Trophy, color: 'var(--accent-green)',  bg: 'rgba(16,185,129,0.12)' },
    { label: `Live: ${stats.liveNow || 0} · Next Ends`, value: countdown, Icon: Clock, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="row g-4">
          {items.map((item, i) => (
            <div key={i} className="col-6 col-md-3">
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="stat-icon-box" style={{ background: item.bg, color: item.color }}>
                  <item.Icon size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GiveawayStats;
