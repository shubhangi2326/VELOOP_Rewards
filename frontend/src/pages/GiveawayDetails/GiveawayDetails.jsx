import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Info, ShieldCheck, Wallet, Trophy } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import Countdown from '../../components/Countdown/Countdown';
import HowThisGiveawayWorks from '../../components/HowThisGiveawayWorks/HowThisGiveawayWorks';
import ImportantInformation from '../../components/ImportantInformation/ImportantInformation';
import { giveawayConfig } from '../../data/giveawayConfig';
import styles from './GiveawayDetails.module.css';
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

  useEffect(() => {
    let ignore = false;
    const fetchDetails = async () => {
      try {
        const g = await api.getGiveawayById(giveawayId);
        if (ignore) return;
        
        if (g) {
          setGiveaway(g);
          const p = g.prizes.find(p => p.id === prizeId);
          setPrize(p);
        }
        
        if (user) {
          const status = await api.getMyStatus(giveawayId);
          if (ignore) return;
          if (status.isParticipating) {
            setAlreadyParticipating(true);
          }
        }
      } catch (err) {
        if (!ignore && err.status !== 404) {
          console.error("Failed to fetch giveaway details:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    
    fetchDetails();
    return () => { ignore = true; };
  }, [giveawayId, prizeId, user]);

  if (loading || authLoading) return <ThemedLoader fullScreen={true} />;
  
  if (!giveaway || !prize) {
    return (
      <div className="container text-center py-5">
        <h2>Giveaway or Prize not found</h2>
        <Link to="/giveaways" className="btn btn-outline-light mt-3">Back to Giveaways</Link>
      </div>
    );
  }

  const userBalance = user?.balances?.[prize.entryCurrency] || 0;
  const hasSufficientBalance = userBalance >= prize.entryFee;

  const handleJoinClick = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/giveaways/${giveawayId}/prize/${prizeId}` } });
      return;
    }
    
    if (!hasSufficientBalance) {
      setError(`Insufficient ${prize.entryCurrency}. You need ${prize.entryFee - userBalance} more to join.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmJoin = async () => {
    setIsJoining(true);
    setError('');
    
    try {
      const response = await api.joinGiveaway(giveawayId, prize.id);
      if (response.success) {
        updateBalance(prize.entryCurrency, response.newBalance);
        setJoinSuccess(true);
        setShowConfirmModal(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to join giveaway. Please try again.');
      if (err.error === 'ALREADY_PARTICIPATING') {
         setAlreadyParticipating(true);
         setShowConfirmModal(false);
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.detailsPage}>
      <div className={styles.topNav}>
        <div className="container">
          <Link to="/giveaways" className={styles.backLink}>
            <ArrowLeft size={18} /> Giveaway Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <div className={styles.imageWrapper}>
                {prize.image ? (
                  <img src={prize.image} alt={prize.name} className={styles.prizeImage} />
                ) : (
                  <div className={`${styles.prizeImage} d-flex align-items-center justify-content-center bg-dark bg-opacity-50`}>
                    <Trophy size={64} className="text-muted opacity-50" />
                  </div>
                )}
                <div className={`${styles.statusBadge} ${giveaway.status !== 'active' ? styles.statusEnded : ''}`}>
                  <span className={styles.statusDot}></span> GIVEAWAY {giveaway.status === 'active' ? 'LIVE' : giveaway.status.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.heroInfo}>
                <div className={styles.exclusiveBadge}>EXCLUSIVE GIVEAWAY</div>
                <h1 className={styles.prizeName}>Win an {prize.name}</h1>
                <p className={styles.prizeDesc}>{prize.description || "Join this amazing giveaway for a chance to win!"}</p>
                
                <div className={styles.countdownBox}>
                  <Countdown 
                    targetDate={giveaway.endDate} 
                    onEnd={() => setGiveaway(g => ({ ...g, status: 'ended' }))} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8">
             <div className={styles.infoCard}>
               <h3><ShieldCheck size={20} className="me-2 text-primary" /> Eligibility & Rules</h3>
               <ul className={styles.rulesList}>
                 <li><strong>Eligibility:</strong> {giveaway.eligibility || "Open to all active VELOOP users."}</li>
                 <li><strong>Entry Requirement:</strong> {prize.entryFee} {prize.entryCurrency} per participation.</li>
                 {giveaway.rules && giveaway.rules.length > 0 ? (
                   giveaway.rules.map((rule, idx) => (
                     <li key={idx}>{rule}</li>
                   ))
                 ) : (
                   <li className="text-muted fst-italic">Rules will be available soon.</li>
                 )}
               </ul>
               
               <hr className="my-5 border-secondary" />
               <HowThisGiveawayWorks timeline={giveawayConfig.detailsTimeline} />
               
               <hr className="my-5 border-secondary" />
               <ImportantInformation info={giveawayConfig.importantInfo} />

               <hr className="my-5 border-secondary" />
               <h3><Info size={20} className="me-2 text-primary" /> About the Prize</h3>
               <p>{prize.description}. Join this exclusive giveaway for a chance to win. There will be {prize.winnerCount} winner(s) selected after the countdown ends.</p>
             </div>
          </div>
          
          <div className="col-lg-4 mt-4 mt-lg-0">
            {/* Participation Card */}
            <div className={styles.actionCard}>
              <h3 className={styles.actionTitle}>Join Giveaway</h3>
              
              {joinSuccess || alreadyParticipating ? (
                <div className={styles.successState}>
                  <CheckCircle size={48} className="text-success mb-3" />
                  <h4>{alreadyParticipating ? "Already Participating" : "You're In!"}</h4>
                  <p>Your participation for the <strong>{prize.name}</strong> giveaway is active.</p>
                  <div className={styles.feeInfo}>
                    Entry Fee Paid: <strong>{prize.entryFee} {prize.entryCurrency}</strong>
                  </div>
                  <p className="mt-3 text-light opacity-75 small">Good luck! 🎉</p>
                  {alreadyParticipating && (
                    <button className={styles.secondaryBtn} onClick={() => navigate('/profile/giveaways')}>
                      View Giveaway Status
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.feeDisplay}>
                    <span className={styles.feeLabel}>Entry Fee</span>
                    <span className={styles.feeValue}>{prize.entryFee} {prize.entryCurrency}</span>
                  </div>
                  
                  {user && (
                    <div className={`${styles.balanceCheck} ${hasSufficientBalance ? styles.balanceOk : styles.balanceLow}`}>
                      <Wallet size={16} />
                      <span>Your Balance: {userBalance} {prize.entryCurrency}</span>
                      {hasSufficientBalance ? (
                         <CheckCircle size={16} className="ms-auto" />
                      ) : (
                         <AlertCircle size={16} className="ms-auto" />
                      )}
                    </div>
                  )}

                  {error && <div className={styles.errorAlert}>{error}</div>}

                  {giveaway.status !== 'active' ? (
                    <button className={`${styles.mainJoinBtn} ${styles.btnDisabled}`} disabled>
                      {giveaway.status === 'ended' ? 'Giveaway Ended' : 'Giveaway Not Active'}
                    </button>
                  ) : (
                    <>
                      <button 
                        className={`${styles.mainJoinBtn} ${!hasSufficientBalance && user ? styles.btnDisabled : ''}`}
                        onClick={handleJoinClick}
                        disabled={(!hasSufficientBalance && user)}
                      >
                        {!user ? 'Login to Join' : `Join for ${prize.entryFee} ${prize.entryCurrency}`}
                      </button>
                      
                      {!hasSufficientBalance && user && (
                        <button className={styles.secondaryBtn}>Earn More {prize.entryCurrency} →</button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className="mb-4">Confirm Participation</h3>
            <div className={styles.modalPrizeInfo}>
              <img src={prize.image} alt={prize.name} className={styles.modalImg} />
              <h5>{prize.name}</h5>
            </div>
            
            <div className={styles.modalStats}>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-light opacity-75">Entry Fee</span>
                <strong className="text-light">{prize.entryFee} {prize.entryCurrency}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-light opacity-75">Your Balance</span>
                <strong className="text-light">{userBalance} {prize.entryCurrency}</strong>
              </div>
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between">
                <span className="text-light opacity-75">Balance After Joining</span>
                <strong className="text-warning">{userBalance - prize.entryFee} {prize.entryCurrency}</strong>
              </div>
            </div>
            
            <p className="text-light opacity-75 small mb-4 text-center">
              By continuing, you confirm that you have reviewed the giveaway rules and terms.
            </p>
            
            <div className="d-flex gap-3">
              <button className="btn btn-outline-secondary w-50" onClick={() => setShowConfirmModal(false)} disabled={isJoining}>
                Cancel
              </button>
              <button className="btn btn-primary w-50 d-flex align-items-center justify-content-center" onClick={confirmJoin} disabled={isJoining}>
                {isJoining ? (
                  <>Joining... <span className="spinner-border spinner-border-sm ms-2"></span></>
                ) : (
                  'Confirm & Join'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiveawayDetails;
