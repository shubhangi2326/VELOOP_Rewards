import React, { useState, useEffect } from 'react';
import { History, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import PrizeCard from '../PrizeCard/PrizeCard';
import ThemedLoader from '../ThemedLoader/ThemedLoader';
import styles from './PreviousGiveawaysSection.module.css';

const PreviousGiveawaysSection = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPreviousGiveaways = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getPreviousGiveaways();
      setGiveaways(data || []);
    } catch (err) {
      console.error("Failed to fetch previous giveaways:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousGiveaways();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="container text-center py-5">
          <ThemedLoader />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <History size={28} className="text-primary" aria-hidden="true" />
          </div>
          <h2 className={styles.title}>Past Giveaways</h2>
          <p className={styles.subtitle}>Check out our recently ended campaigns and see who won.</p>
        </div>

        {error ? (
          <div className={styles.errorState}>
            <AlertCircle size={40} className="text-danger mb-3" aria-hidden="true" />
            <h5>Failed to load previous giveaways</h5>
            <button className="btn btn-outline-light mt-3" onClick={fetchPreviousGiveaways}>
              Retry
            </button>
          </div>
        ) : giveaways.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={48} className="text-muted mb-3 opacity-50" aria-hidden="true" />
            <h4 className="text-light">No Previous Winners</h4>
            <p className="text-muted">There are no ended giveaways to display yet.</p>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {giveaways.map((giveaway) => {
              // Usually display the primary prize (position 1)
              const primaryPrize = giveaway.prizes?.[0];
              if (!primaryPrize) return null;

              return (
                <div key={giveaway.id} className="col-12 col-md-6 col-lg-4">
                  <div className={styles.giveawayWrapper}>
                    <div className={styles.giveawayHeader}>
                      <h4 className={styles.giveawayTitle}>{giveaway.title}</h4>
                      <span className={styles.endDate}>
                        Ended: {new Date(giveaway.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <PrizeCard 
                      prize={primaryPrize}
                      giveawayId={giveaway.id}
                      participantsCount={giveaway.participantsCount}
                      endDate={giveaway.endDate}
                      status={giveaway.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PreviousGiveawaysSection;
