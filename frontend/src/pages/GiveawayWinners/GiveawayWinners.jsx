import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import WinnerCard from '../../components/WinnerCard/WinnerCard';

const GiveawayWinners = () => {
  const { giveawayId } = useParams();
  
  const [giveaway, setGiveaway] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    const loadWinners = async () => {
      setLoading(true);
      setError('');
      
      try {
        const [giveawayData, winnersData] = await Promise.all([
          api.getGiveawayById(giveawayId),
          api.getWinners(giveawayId)
        ]);
        
        if (ignore) return;
        
        setGiveaway(giveawayData);
        setWinners(winnersData || []);
      } catch (err) {
        if (!ignore && err.status !== 404) {
          console.error("Failed to fetch winners data:", err);
        }
        if (!ignore) setError('Failed to load winners information. Please try again later.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    
    loadWinners();
    return () => { ignore = true; };
  }, [giveawayId, retryCount]);

  if (loading) {
    return <ThemedLoader fullScreen={true} />;
  }

  return (
    <div className="gw-winners-page">
      <div className="gw-winners-topnav">
        <div className="container">
          <Link to="/giveaways" className="gw-winners-back">
            <ArrowLeft size={18} aria-hidden="true" /> Back to Giveaways
          </Link>
        </div>
      </div>

      <div className="container py-5">
        <div className="gw-winners-header">
          <div className="gw-winners-icon">
            <Trophy size={32} aria-hidden="true" />
          </div>
          <h1 className="mb-2">Giveaway Winners</h1>
          <p className="text-muted">
            {giveaway ? `Showing results for: ${giveaway.title || 'Giveaway'}` : 'Giveaway Results'}
          </p>
          {giveaway && (
            <div className="gw-winners-status-badge">
              <span className="gw-status-dot"></span>
              {giveaway.status === 'ended' ? 'ENDED' : giveaway.status.toUpperCase()}
            </div>
          )}
        </div>

        {error ? (
          <div className="gw-winners-error">
            <AlertCircle size={48} className="text-danger mb-3" aria-hidden="true" />
            <h3 className="mb-3">Oops! Something went wrong</h3>
            <button className="btn btn-primary" onClick={() => setRetryCount(c => c + 1)}>
              Retry
            </button>
          </div>
        ) : winners.length === 0 ? (
          <div className="gw-winners-empty">
            <Trophy size={64} className="text-muted mb-3 opacity-50" aria-hidden="true" />
            <h3>No Winners Yet</h3>
            <p className="text-muted mt-2">
              Winners for this giveaway have not been announced yet or no one participated.
            </p>
            <Link to="/giveaways" className="btn btn-outline-light mt-4">
              Explore Active Giveaways
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {winners.map((winner) => {
              // Resolve prize from the fetched giveaway data (fall back to first prize ONLY if giveaway has 1 prize)
              let prize = giveaway?.prizes?.find(p => p.id === winner.prizeId);
              if (!prize && giveaway?.prizes?.length === 1) {
                prize = giveaway.prizes[0];
              }
              
              return (
                <div key={winner._id} className="col-12 col-md-6 col-lg-4">
                  <WinnerCard winner={winner} prize={prize} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiveawayWinners;
