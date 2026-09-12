import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="vl-footer">
      <div className="container">
        <div className="row g-5">
          {/* Brand */}
          <div className="col-lg-4 col-md-12">
            <Link to="/giveaways" className="vl-footer-brand">
              <div className="vl-brand-icon" style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                <Sparkles size={16} />
              </div>
              <span><span className="vl-brand-ve">VE</span>LOOP</span>
            </Link>
            <p className="vl-footer-tagline">Premium giveaway platform for exclusive members. Win amazing prizes every week.</p>
          </div>

          {/* Navigation */}
          <div className="col-lg-2 col-6">
            <h6 className="vl-footer-heading">Platform</h6>
            <ul className="vl-footer-links">
              <li><Link to="/giveaways">Giveaways</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-lg-2 col-6">
            <h6 className="vl-footer-heading">Legal</h6>
            <ul className="vl-footer-links">
              <li><Link to="#">Rules</Link></li>
              <li><Link to="#">Terms of Service</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Fairness Policy</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-4 col-md-12">
            <h6 className="vl-footer-heading">Support</h6>
            <div className="vl-footer-badge">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
              All systems operational
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Have a question or need help? Our team is here for you.</p>
            <motion.div whileHover={{ x: 4 }}>
              <Link to="#" className="vl-footer-contact">
                <Mail size={16} /> Contact Support <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="vl-footer-bottom">
          <p className="vl-footer-copy">© {year} VELOOP Rewards. All rights reserved.</p>
          <div className="vl-footer-legal">
            <Link to="#">Privacy</Link>
            <Link to="#">Terms</Link>
            <Link to="#">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
