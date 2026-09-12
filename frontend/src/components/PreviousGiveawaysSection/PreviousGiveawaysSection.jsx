import React, { useState, useEffect } from 'react';
import { History, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import PrizeCard from '../PrizeCard/PrizeCard';
import ThemedLoader from '../ThemedLoader/ThemedLoader';

const PreviousGiveawaysSection = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = async () => {
    setLoading(true); setError(false);
    try { setGiveaways(await api.getPreviousGiveaways() || []); }
    catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return (
    <section className="gw-section">
      <div className="container text-center py-5"><ThemedLoader /></div>
    </section>
  );

  return (
    <section className="gw-section" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="container">
        <div className="gw-section-header">
          <div className="section-icon-wrapper"><History size={26} /></div>
          <div className="section-label" style={{ display: 'inline-flex' }}>Archive</div>
          <h2 className="section-heading">Past <span className="text-gradient">Giveaways</span></h2>
          <p className="section-subtext">Check out our recently ended campaigns and see who won.</p>
        </div>

        {error ? (
          <div className="gw-error-state">
            <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h5>Failed to load previous giveaways</h5>
            <button className="btn btn-outline-light mt-3" onClick={fetch}>Retry</button>
          </div>
        ) : giveaways.length === 0 ? (
          <div className="gw-empty-state">
            <History size={52} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
            <h4>No Previous Giveaways</h4>
            <p style={{ color: 'var(--text-muted)' }}>There are no ended giveaways to display yet.</p>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {giveaways.slice(0, 6).map((giveaway, idx) => {
              const prize = giveaway.prizes?.[0];
              if (!prize) return null;
              return (
                <motion.div
                  key={giveaway.id}
                  className="col-12 col-md-6 col-lg-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="prev-giveaway-wrapper">
                    <div className="prev-giveaway-header">
                      <h4 className="prev-giveaway-title">{giveaway.title}</h4>
                      <span className="prev-giveaway-date">Ended: {new Date(giveaway.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="prev-giveaway-card-inner">
                      <PrizeCard prize={prize} giveawayId={giveaway.id} participantsCount={giveaway.participantsCount} endDate={giveaway.endDate} status={giveaway.status} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PreviousGiveawaysSection;
