import React, { useState, useEffect } from 'react';
import GiveawayHero from '../../components/GiveawayHero/GiveawayHero';
import GiveawayStats from '../../components/GiveawayStats/GiveawayStats';
import PrizeCard from '../../components/PrizeCard/PrizeCard';
import WinnerSlider from '../../components/WinnerSlider/WinnerSlider';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import HowToParticipate from '../../components/HowToParticipate/HowToParticipate';
import PreviousGiveawaysSection from '../../components/PreviousGiveawaysSection/PreviousGiveawaysSection';
import TrustSection from '../../components/TrustSection/TrustSection';
import FAQSection from '../../components/FAQSection/FAQSection';
import { giveawayConfig } from '../../data/giveawayConfig';
import { api } from '../../services/api';
import styles from './GiveawayHome.module.css';

const GiveawayHome = () => {
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGiveaways = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getGiveaways();
      setGiveaways(data || []);
    } catch (err) {
      console.error("Failed to fetch giveaways from backend:", err);
      setError('Failed to load giveaways. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  if (loading) {
    return <ThemedLoader fullScreen={true} />;
  }

  // Usually, there's one active giveaway with multiple prizes
  const currentGiveaway = giveaways[0];

  return (
    <div className={styles.homeContainer}>
      <GiveawayHero />
      <GiveawayStats stats={{ nextEndsIn: currentGiveaway ? 'Live Now' : '—' }} />
      
      <div className={styles.sliderSection}>
        <WinnerSlider />
      </div>

      {error ? (
        <section className={`${styles.featuredSection} text-center py-5`}>
          <div className="container">
            <h3 className="text-danger mb-3">{error}</h3>
            <button className="btn btn-outline-light" onClick={fetchGiveaways}>Retry</button>
          </div>
        </section>
      ) : !currentGiveaway ? (
        <section className={`${styles.featuredSection} text-center py-5`}>
          <div className="container">
             <h2>No Active Giveaways</h2>
             <p className="text-light opacity-75 mt-3">Check back later for exciting new rewards!</p>
          </div>
        </section>
      ) : (
        <section id="featured-giveaways" className={styles.featuredSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Current <span className="text-gradient">Rewards</span></h2>
              <p className={styles.sectionSubtitle}>{currentGiveaway.description || 'Join now before the countdown ends. Exclusive premium prizes waiting for you.'}</p>
            </div>
            
            <div className="row g-4">
              {currentGiveaway.prizes.map((prize) => (
                <div key={prize.id} className="col-12 col-md-6 col-lg-3">
                  <PrizeCard 
                    prize={prize} 
                    giveawayId={currentGiveaway.id}
                    participantsCount={currentGiveaway.participantsCount}
                    endDate={currentGiveaway.endDate}
                    status={currentGiveaway.status}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <HowToParticipate steps={giveawayConfig.howToParticipate} />
      <PreviousGiveawaysSection />
      <TrustSection points={giveawayConfig.trustPoints} />
      <FAQSection faqs={giveawayConfig.faqs} />
    </div>
  );
};

export default GiveawayHome;
