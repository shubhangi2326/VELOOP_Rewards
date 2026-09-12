import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import { Calendar, Ticket, Gift, CheckCircle, Trophy } from 'lucide-react';
import PrizeClaimModal from '../../components/PrizeClaimModal/PrizeClaimModal';
import styles from './UserGiveaways.module.css';

const UserGiveaways = () => {
  const { user, loading: authLoading } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [claimData, setClaimData] = useState(null);

  const fetchParticipations = async () => {
    try {
      const data = await api.getMyParticipations();
      setParticipations(data);
    } catch (err) {
      console.error("Failed to fetch participations:", err);
      setError("Failed to load your giveaway status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchParticipations();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleClaimSuccess = () => {
    setClaimData(null);
    fetchParticipations(); // Refresh to update status
  };

  if (loading || authLoading) return <ThemedLoader fullScreen={true} />;

  if (!user) {
    return (
      <div className="container text-center py-5">
        <h2>Please login to view your giveaways</h2>
        <Link to="/login" className="btn btn-primary mt-3">Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>My Giveaways</h1>
          <p>Track all your active and past giveaway participations</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && participations.length === 0 ? (
          <div className={styles.emptyState}>
            <Gift size={48} className="text-muted mb-3" />
            <h3>No Participations Yet</h3>
            <p>You haven't joined any giveaways. Start exploring and win exciting prizes!</p>
            <Link to="/giveaways" className="btn btn-primary">Browse Giveaways</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {participations.map((p) => (
              <div key={p._id} className={styles.card}>
                <div className="d-flex justify-content-between align-items-start">
                  <span className={`${styles.statusBadge} ${p.giveawayStatus === 'active' ? styles.statusActive : styles.statusEnded}`}>
                    {p.giveawayStatus}
                  </span>
                  {p.status === 'active' && !p.isWinner && (
                     <CheckCircle size={20} className="text-success" title="Participation Active" />
                  )}
                  {p.isWinner && (
                     <Trophy size={20} className="text-warning" title="Winner!" />
                  )}
                </div>
                
                <h3 className={styles.giveawayName}>{p.giveawayName}</h3>
                <div className={styles.prizeName}>{p.prizeName}</div>
                
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}><Ticket size={14} className="me-1"/> Entry Fee</span>
                    <span className={styles.detailValue}>{p.entryAmount} {p.entryCurrency}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}><CheckCircle size={14} className="me-1"/> Status</span>
                    <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
                      {p.isWinner ? 'Winner' : p.status}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}><Calendar size={14} className="me-1"/> Date Joined</span>
                    <span className={styles.detailValue}>
                      {new Date(p.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                {p.isWinner && p.winnerStatus === 'pending_claim' ? (
                  <button 
                    className="btn btn-warning w-100 mt-3 btn-sm"
                    onClick={() => {
                      setClaimData({
                        giveawayId: p.giveawayId,
                        prize: {
                          id: p.prizeId,
                          name: p.prizeName,
                          type: p.prizeType
                        }
                      });
                    }}
                  >
                    Claim Prize
                  </button>
                ) : p.isWinner && p.winnerStatus === 'claimed' ? (
                  <button className="btn btn-info w-100 mt-3 btn-sm" disabled>
                    Claim Submitted
                  </button>
                ) : p.giveawayStatus === 'unknown' ? (
                  <button className="btn btn-secondary w-100 mt-3 btn-sm" disabled>
                    Giveaway no longer available
                  </button>
                ) : p.isWinner && p.winnerStatus === 'processing' ? (
                  <button className="btn btn-secondary w-100 mt-3 btn-sm" disabled>
                    Prize Verification In Progress
                  </button>
                ) : p.isWinner && p.winnerStatus === 'completed' ? (
                  <button className="btn btn-success w-100 mt-3 btn-sm" disabled>
                    Prize Delivered
                  </button>
                ) : p.isWinner && p.winnerStatus === 'expired' ? (
                  <button className="btn btn-danger w-100 mt-3 btn-sm" disabled>
                    Claim Window Expired
                  </button>
                ) : p.giveawayStatus === 'ended' ? (
                  <Link to={`/giveaways/${p.giveawayId}/winners`} className="btn btn-outline-secondary w-100 mt-3 btn-sm">
                    View Winners
                  </Link>
                ) : (
                  <Link to={`/giveaways/${p.giveawayId}/prize/${p.prizeId}`} className="btn btn-outline-secondary w-100 mt-3 btn-sm">
                    View Details
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {claimData && (
        <PrizeClaimModal 
          giveawayId={claimData.giveawayId} 
          prize={claimData.prize} 
          onClose={() => setClaimData(null)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
};

export default UserGiveaways;
