import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gift, LogOut, Wallet } from 'lucide-react';
import styles from './TopNavbar.module.css';

const TopNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/giveaways" className={styles.brand}>
          <Gift className={styles.brandIcon} />
          <span>VELOOP <span className="text-gradient d-none d-sm-inline">Rewards</span></span>
        </Link>
        
        <div className={styles.navActions}>
          {user ? (
            <div className="d-flex align-items-center gap-2 gap-md-4">
              <div className={styles.balances}>
                <div className={styles.balanceBadge}>
                  <Wallet size={14} className="text-warning" />
                  <span>{user.balances?.VEs || 0} VEs</span>
                </div>
              </div>
              <div className={styles.userMenu}>
                <span className={`${styles.userName} d-none d-md-block`}>{user.name}</span>
                <button onClick={logout} className={styles.logoutBtn} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
