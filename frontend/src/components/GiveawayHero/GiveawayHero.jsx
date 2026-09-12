import React from 'react';
import styles from './GiveawayHero.module.css';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const GiveawayHero = () => {
  const scrollToGiveaways = () => {
    document.getElementById('featured-giveaways')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroBg}>
        <div className={styles.glow1}></div>
        <div className={styles.glow2}></div>
      </div>
      
      <div className={`container ${styles.content}`}>
        <div className="row align-items-center">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.badge}>
                <Sparkles size={16} />
                <span>EXCLUSIVE GIVEAWAYS</span>
              </div>
              <h1 className={styles.title}>
                Giveaway <span className="text-gradient">Rewards</span>
              </h1>
              <p className={styles.subtitle}>
                Complete tasks. Earn entries. Get a chance to win premium devices and exclusive gift cards every week.
              </p>
              
              <button className={styles.ctaButton} onClick={scrollToGiveaways}>
                Explore Rewards <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
          
          <div className="col-lg-6">
            <motion.div 
              className={styles.imageWrapper}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className={styles.floatingCard1}>
                <img src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=300&q=80" alt="iPhone" />
              </div>
              <div className={styles.floatingCard2}>
                <img src="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&q=80" alt="Watch" />
              </div>
              <div className={styles.centerDecor}>
                <GiftIcon />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GiftIcon = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <defs>
      <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="1" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

export default GiveawayHero;
