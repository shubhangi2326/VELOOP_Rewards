import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Wallet, Menu, Sparkles, X, ChevronRight } from 'lucide-react';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLogout = () => { logout(); navigate('/'); setIsMenuOpen(false); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      <motion.nav
        className={`vl-nav ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container vl-nav-inner">
          <Link className="vl-brand" to="/" onClick={() => setIsMenuOpen(false)}>
            <div className="vl-brand-icon">
              <Sparkles size={18} />
            </div>
            <span><span className="vl-brand-ve">VE</span>LOOP</span>
          </Link>

          <div className="vl-desktop-nav">
            <Link className={`vl-nav-link ${isActive('/giveaways') ? 'active' : ''}`} to="/giveaways">Giveaways</Link>
            {user && <Link className={`vl-nav-link ${isActive('/profile') ? 'active' : ''}`} to="/profile">Profile</Link>}
          </div>

          <div className="vl-desktop-auth">
            {!user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/login" className="vl-login-btn">Sign In</Link>
                <Link to="/signup" className="vl-signup-btn">
                  <Sparkles size={16} /> Get Started
                </Link>
              </div>
            ) : (
              <div className="vl-user-group">
                <div className="vl-balance-badge">
                  <Wallet size={15} style={{ color: 'var(--text-muted)' }} />
                  {user.balances?.VE || 0}
                  <span className="vl-balance-currency">VEs</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/profile" className="vl-icon-btn" title="Profile">
                    <User size={18} />
                  </Link>
                  <button onClick={handleLogout} className="vl-icon-btn danger" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="vl-toggler" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="vl-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="vl-mobile-menu"
              initial={{ y: '-8%' }}
              animate={{ y: 0 }}
              exit={{ y: '-8%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              <div className="vl-mobile-links">
                <Link to="/giveaways" className={`vl-mobile-link ${isActive('/giveaways') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  Giveaways <ChevronRight size={20} />
                </Link>
                {user && (
                  <Link to="/profile" className={`vl-mobile-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    My Profile <ChevronRight size={20} />
                  </Link>
                )}
              </div>

              <div className="vl-mobile-auth">
                {!user ? (
                  <>
                    <Link to="/login" className="vl-mobile-btn-ghost" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    <Link to="/signup" className="vl-mobile-btn-primary" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                  </>
                ) : (
                  <div className="vl-mobile-user-box">
                    <div className="vl-mobile-balance-label">Available Balance</div>
                    <div className="vl-mobile-balance-value">
                      <Wallet size={20} /> {user.balances?.VE || 0} <span>VEs</span>
                    </div>
                    <button onClick={handleLogout} className="vl-mobile-logout">
                      <LogOut size={20} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNavbar;
