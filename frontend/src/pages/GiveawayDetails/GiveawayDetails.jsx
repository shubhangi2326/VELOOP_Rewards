import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Info, ShieldCheck, Wallet, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import Countdown from '../../components/Countdown/Countdown';
import HowThisGiveawayWorks from '../../components/HowThisGiveawayWorks/HowThisGiveawayWorks';
import ImportantInformation from '../../components/ImportantInformation/ImportantInformation';
import { giveawayConfig } from '../../data/giveawayConfig';
import { api } from '../../services/api';

const GiveawayDetails = () => {
  const { giveawayId, prizeId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, updateBalance } = useAuth();
  const [giveaway, setGiveaway] = useState(null);
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [alreadyParticipating, setAlreadyParticipating] = useState(false);
  const [error, setError] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchDetails = async () => {
      try {
        const g = await api.getGiveawayById(giveawayId);
        if (ignore) return;
        if (g) { setGiveaway(g); setPrize(g.prizes.find(p => p.id === prizeId)); }
        if (user) {
          const status = await api.getMyStatus(giveawayId);
          if (!ignore && status.isParticipating) setAlreadyParticipating(true);
        }
      } catch (err) {
        if (!ignore && err.status !== 404) console.error('Failed to fetch giveaway details:', err);
      } finally { if (!ignore) setLoading(false); }
    };
    fetchDetails();
    return () => { ignore = true; };
  }, [giveawayId, prizeId, user]);

  if (loading || authLoading) return <ThemedLoader fullScreen />;
  if (!giveaway || !prize) return (
    <div className="container text-center py-5" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2>Giveaway or Prize not found</h2>
      <Link to="/giveaways" className="btn btn-outline-light mt-3">Back to Giveaways</Link>
    </div>
  );

  const userBalance = user?.balances?.[prize.entryCurrency] || 0;
  const hasSufficientBalance = userBalance >= prize.entryFee;

  const handleJoinClick = () => {
    if (!user) { navigate('/login', { state: { returnTo: `/giveaways/${giveawayId}/prize/${prizeId}` } }); return; }
    if (!hasSufficientBalance) { setError(`Insufficient ${prize.entryCurrency}. You need ${prize.entryFee - userBalance} more.`); return; }
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setIdempotencyKey(null);
  };

  const confirmJoin = async () => {
    setIsJoining(true); setError('');
    let currentKey = idempotencyKey;
    if (!currentKey) {
      currentKey = crypto.randomUUID();
      setIdempotencyKey(currentKey);
    }
    try {
      const r = await api.joinGiveaway(giveawayId, prize.id, currentKey);
      if (r.success) { updateBalance(prize.entryCurrency, r.newBalance); setJoinSuccess(true); handleCloseModal(); }
    } catch (err) {
      setError(err.message || 'Failed to join. Please try again.');
      if (err.error === 'ALREADY_PARTICIPATING') { setAlreadyParticipating(true); handleCloseModal(); }
    } finally { setIsJoining(false); }
  };

  return (
    <div className="gw-details-page">
      <div className="gw-details-topnav">
        <div className="container">
          <Link to="/giveaways" className="gw-details-back"><ArrowLeft size={18} /> Giveaway Home</Link>
        </div>
      </div>

      <div className="gw-details-hero">
        <div className="gw-details-hero-bg">
          <motion.div className="gw-details-glow" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="container gw-details-hero-inner">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <motion.div className="gw-details-img-wrap" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                {prize.image ? <img src={prize.image} alt={prize.name} className="gw-details-img" /> : (
                  <div className="gw-details-img" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#18181b' }}>
                    <Trophy size={64} style={{ color: '#27272a' }} />
                  </div>
                )}
                <div className={`gw-details-status-badge ${giveaway.status === 'active' ? 'gw-status-live' : 'gw-status-ended'}`}>
                  <span className="gw-status-dot" /> GIVEAWAY {giveaway.status === 'active' ? 'LIVE' : giveaway.status.toUpperCase()}
                </div>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div className="gw-hero-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className="gw-exclusive-badge">EXCLUSIVE GIVEAWAY</div>
                <h1 className="gw-prize-name">Win a <span className="text-gradient-primary">{prize.name}</span></h1>
                <p className="gw-prize-desc">{prize.description || 'Join this amazing giveaway for a chance to win!'}</p>
                <div className="gw-countdown-box">
                  <Countdown targetDate={giveaway.endDate} onEnd={() => setGiveaway(g => ({ ...g, status: 'ended' }))} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8">
            <motion.div className="gw-info-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3><ShieldCheck size={20} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} /> Eligibility &amp; Rules</h3>
              <ul className="gw-rules-list">
                <li><strong>Eligibility:</strong> {giveaway.eligibility || 'Open to all active VELOOP users.'}</li>
                <li><strong>Entry Requirement:</strong> {prize.entryFee} {prize.entryCurrency} per participation.</li>
                {giveaway.rules?.length > 0 ? giveaway.rules.map((r, i) => <li key={i}>{r}</li>) : <li style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Rules will be available soon.</li>}
              </ul>
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '2.5rem 0' }} />
              <div className="htgw-section"><HowThisGiveawayWorks timeline={giveawayConfig.detailsTimeline} /></div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '2.5rem 0' }} />
              <ImportantInformation info={giveawayConfig.importantInfo} />
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '2.5rem 0' }} />
              <h3><Info size={20} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} /> About the Prize</h3>
              <p style={{ color: 'var(--text-subtle)', lineHeight: '1.65' }}>{prize.description}. There will be {prize.winnerCount} winner(s) selected after the countdown ends.</p>
            </motion.div>
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="gw-action-sticky">
              <motion.div className="gw-action-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <h3 className="gw-action-title">Join Giveaway</h3>
                {joinSuccess || alreadyParticipating ? (
                  <div className="gw-success-state">
                    <CheckCircle size={48} style={{ color: 'var(--accent-green)', display: 'block', margin: '0 auto 1rem' }} />
                    <h4 style={{ textAlign: 'center' }}>{alreadyParticipating ? 'Already Participating' : "You're In!"}</h4>
                    <p style={{ color: 'var(--text-subtle)', textAlign: 'center' }}>Your entry for <strong>{prize.name}</strong> is active.</p>
                    <div className="gw-fee-info">Entry Fee Paid: <strong>{prize.entryFee} {prize.entryCurrency}</strong></div>
                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Good luck! 🎉</p>
                    {alreadyParticipating && <button className="gw-secondary-btn" onClick={() => navigate('/profile/giveaways')}>View Giveaway Status</button>}
                  </div>
                ) : (
                  <>
                    <div className="gw-fee-display">
                      <div className="gw-fee-label">Entry Fee</div>
                      <div className="gw-fee-value">{prize.entryFee}<span className="gw-fee-currency">{prize.entryCurrency}</span></div>
                    </div>
                    {user && (
                      <div className={`gw-balance-row ${hasSufficientBalance ? 'gw-balance-ok' : 'gw-balance-low'}`}>
                        <Wallet size={16} />
                        <span>Balance: {userBalance} {prize.entryCurrency}</span>
                        {hasSufficientBalance ? <CheckCircle size={16} style={{ marginLeft: 'auto' }} /> : <AlertCircle size={16} style={{ marginLeft: 'auto' }} />}
                      </div>
                    )}
                    {error && <div className="gw-action-error"><AlertCircle size={16} />{error}</div>}
                    {giveaway.status !== 'active' ? (
                      <button className={`gw-join-btn gw-join-btn-disabled`} disabled>{giveaway.status === 'ended' ? 'Giveaway Ended' : 'Not Active'}</button>
                    ) : (
                      <>
                        <button className={`gw-join-btn ${!hasSufficientBalance && user ? 'gw-join-btn-disabled' : ''}`} onClick={handleJoinClick} disabled={!hasSufficientBalance && !!user}>
                          {!user ? 'Login to Join' : `Join for ${prize.entryFee} ${prize.entryCurrency}`}
                        </button>
                        {!hasSufficientBalance && user && <button className="gw-secondary-btn">Earn More {prize.entryCurrency} →</button>}
                      </>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div className="gw-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="gw-modal-box" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Confirm Participation</h3>
              <div className="gw-modal-prize-row">
                {prize.image && <img src={prize.image} alt={prize.name} className="gw-modal-prize-img" />}
                <h5 style={{ margin: 0 }}>{prize.name}</h5>
              </div>
              <div className="gw-modal-stats">
                <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--text-muted)' }}>Entry Fee</span><strong>{prize.entryFee} {prize.entryCurrency}</strong></div>
                <div className="d-flex justify-content-between mb-2"><span style={{ color: 'var(--text-muted)' }}>Your Balance</span><strong>{userBalance} {prize.entryCurrency}</strong></div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                <div className="d-flex justify-content-between"><span style={{ color: 'var(--text-muted)' }}>After Joining</span><strong style={{ color: 'var(--accent-gold)' }}>{userBalance - prize.entryFee} {prize.entryCurrency}</strong></div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>By continuing, you confirm you have reviewed the rules.</p>
              <div className="d-flex gap-3">
                <button className="btn btn-outline-secondary w-50" onClick={handleCloseModal} disabled={isJoining}>Cancel</button>
                <button className="btn btn-primary w-50 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', border: 'none' }} onClick={confirmJoin} disabled={isJoining}>
                  {isJoining ? <>Joining… <span className="spinner-border spinner-border-sm ms-2" /></> : 'Confirm & Join'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiveawayDetails;
