import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import { Trophy, Gift, ArrowRight, Wallet, History, AlertCircle } from 'lucide-react';

const UserGiveaways = () => {
  const { user, loading: authLoading } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchParticipations = async () => {
    setLoading(true); setError(null);
    try { setParticipations(await api.getMyParticipations() || []); }
    catch { setError('Failed to load your giveaways. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) fetchParticipations();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  if (authLoading || loading) return <ThemedLoader fullScreen />;
  if (!user) return (
    <div className="profile-empty">
      <h3>Please log in to view your giveaways</h3>
      <Link to="/login" className="btn btn-primary mt-3">Sign In</Link>
    </div>
  );

  const active = participations.filter(p => p.giveawayStatus === 'active' || p.giveawayStatus === 'upcoming');
  const ended = participations.filter(p => p.giveawayStatus === 'ended');
  const totalSpent = participations.reduce((acc, p) => acc + (p.entryFeePaid || 0), 0);
  const displayed = filter === 'all' ? participations : filter === 'active' ? active : ended;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <motion.h1 className="profile-title" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            My <span className="text-gradient">Giveaways</span>
          </motion.h1>
          <motion.p className="profile-subtitle" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            Track your participations, view results, and claim your prizes.
          </motion.p>
        </div>

        <div className="profile-stats-grid">
          {[
            { Icon: History, color: 'var(--primary-color)', bg: 'rgba(99,102,241,0.12)', value: participations.length, label: 'Total Participations' },
            { Icon: Gift,    color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.12)',  value: active.length,         label: 'Active Now' },
            { Icon: Wallet,  color: 'var(--accent-gold)',  bg: 'rgba(251,191,36,0.12)', value: `${totalSpent} VEs`,   label: 'Total VEs Spent' },
          ].map(({ Icon, color, bg, value, label }, i) => (
            <motion.div key={i} className="profile-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <div className="profile-stat-icon" style={{ background: bg, color }}><Icon size={22} /></div>
              <div>
                <div className="profile-stat-value">{value}</div>
                <div className="profile-stat-label">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="profile-tabs">
          {[['all', 'All', participations.length], ['active', 'Active', active.length], ['ended', 'Ended', ended.length]].map(([val, label, count]) => (
            <button key={val} className={`profile-tab-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
              {label} ({count})
            </button>
          ))}
        </div>

        {error && (
          <div className="profile-error">
            <AlertCircle size={48} style={{ color: '#ef4444', display: 'block', margin: '0 auto 1rem' }} />
            <h4>{error}</h4>
            <button className="btn btn-outline-light mt-3" onClick={fetchParticipations}>Retry</button>
          </div>
        )}

        {!error && displayed.length === 0 ? (
          <motion.div className="profile-empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Trophy size={60} style={{ color: 'var(--text-muted)', opacity: 0.35, display: 'block', margin: '0 auto 1.25rem' }} />
            <h3>No {filter !== 'all' ? filter : ''} giveaways found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't participated in any {filter !== 'all' ? filter : ''} giveaways yet.</p>
            <Link to="/giveaways" className="btn btn-primary d-inline-flex align-items-center gap-2">
              Browse Giveaways <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {displayed.map((p, i) => (
                <motion.div key={p.participationId} className="col-12 col-md-6 col-lg-4" layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                  <div className="participation-card">
                    <div className="participation-card-top">
                      <span className={`participation-status-badge ${p.giveawayStatus === 'active' ? 'participation-status-active' : 'participation-status-ended'}`}>{p.giveawayStatus}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.participatedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="participation-card-title">{p.giveawayTitle || 'Unknown Giveaway'}</h3>
                    <p className="participation-card-prize">Prize: <strong>{p.prizeName || 'Unknown Prize'}</strong></p>
                    <div className="participation-card-details">
                      <div className="participation-detail-row">
                        <span className="participation-detail-label">Entry Fee Paid</span>
                        <span className="participation-detail-value">{p.entryFeePaid || 0} {p.currency}</span>
                      </div>
                      <div className="participation-detail-row">
                        <span className="participation-detail-label">Ticket ID</span>
                        <span className="participation-detail-value" style={{ fontFamily: 'monospace' }}>{p.participationId.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    {p.giveawayStatus === 'ended'
                      ? <Link to={`/giveaways/${p.giveawayId}/winners`} className={`participation-card-link participation-link-result`}>View Results <ArrowRight size={15} /></Link>
                      : <Link to={`/giveaways/${p.giveawayId}/prize/${p.prizeId}`} className={`participation-card-link participation-link-view`}>View Details</Link>
                    }
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGiveaways;
