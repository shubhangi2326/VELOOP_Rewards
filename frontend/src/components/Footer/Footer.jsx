import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Mail } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-4 text-center text-lg-start">
            <Link to="/giveaways" className={styles.brand}>
              <Gift className={styles.brandIcon} size={20} />
              <span>VELOOP <span className="text-gradient">Rewards</span></span>
            </Link>
            <p className={styles.tagline}>Premium rewards for exclusive members.</p>
          </div>
          
          <div className="col-lg-4 text-center">
            <div className={styles.links}>
              <Link to="/giveaways" className={styles.link}>Giveaway Home</Link>
              <Link to="#" className={styles.link}>Rules</Link>
              <Link to="#" className={styles.link}>Terms</Link>
              <Link to="#" className={styles.link}>Privacy</Link>
              <Link to="#" className={styles.link}>Support</Link>
            </div>
          </div>
          
          <div className="col-lg-4 text-center text-lg-end">
            <div className={styles.supportBox}>
              <p className={styles.supportText}>Have questions?</p>
              <Link to="#" className={styles.supportLink}>
                <Mail size={16} /> Contact VELOOP Rewards support
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomBar}>
          <p>&copy; {new Date().getFullYear()} VELOOP Rewards. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
