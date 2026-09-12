import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ThemedLoader from '../../components/ThemedLoader/ThemedLoader';
import { User, Mail, Calendar, ShieldCheck, Wallet, Trophy, ArrowRight, LogOut, RefreshCw, AlertCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMe();
      setProfileData(data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError("Failed to load profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Helper to extract uppercase initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (authLoading || loading) {
    return <ThemedLoader fullScreen />;
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-empty">
            <User size={56} style={{ color: 'var(--text-muted)', opacity: 0.5, display: 'block', margin: '0 auto 1.25rem' }} />
            <h3>Please Sign In</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.75rem 0 1.5rem' }}>
              You need to be logged in to view your profile dashboard and balance information.
            </p>
            <Link to="/login" className="btn btn-primary d-inline-flex align-items-center gap-2">
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const name = profileData?.name || user.name || 'User';
  const email = profileData?.email || user.email || '';
  const role = profileData?.role || 'user';
  const avatarUrl = profileData?.avatar;
  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  const balances = profileData?.balances || user.balances || { VEs: 0, SVEs: 0, Tokens: 0 };
  const stats = profileData?.stats || { totalParticipations: 0, totalVesSpent: 0 };

  return (
    <div className="profile-page">
      <div className="container">

        {/* Profile Card Header */}
        <motion.div
          className="user-profile-hero-card mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="user-profile-hero-content">
            <div className="user-profile-avatar-container">
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="user-profile-avatar-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="user-profile-avatar-initials">
                  {getInitials(name)}
                </div>
              )}
            </div>

            <div className="user-profile-identity">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="user-profile-name m-0">{name}</h1>
                <span className="user-role-badge">
                  <ShieldCheck size={13} /> {role.toUpperCase()}
                </span>
              </div>
              <div className="user-profile-meta mt-2">
                <span className="user-meta-item">
                  <Mail size={14} /> {email}
                </span>
                <span className="user-meta-divider">•</span>
                <span className="user-meta-item">
                  <Calendar size={14} /> Joined {memberSince}
                </span>
              </div>
            </div>

            <div className="user-profile-actions">
              <Link to="/profile/giveaways" className="btn btn-primary d-inline-flex align-items-center gap-2">
                <Trophy size={16} /> My Giveaways
              </Link>
              <button onClick={logout} className="btn btn-outline-danger d-inline-flex align-items-center gap-2">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="profile-error mb-4">
            <AlertCircle size={40} style={{ color: '#ef4444', display: 'block', margin: '0 auto 1rem' }} />
            <h4>{error}</h4>
            <button className="btn btn-outline-light mt-3 d-inline-flex align-items-center gap-2" onClick={fetchProfile}>
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        {/* Wallet Balances Section */}
        <div className="mb-4">
          <h2 className="section-title mb-3" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Wallet <span className="text-gradient">Balances</span>
          </h2>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="profile-stat-card balance-card-ve">
                <div className="profile-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="profile-stat-value">{balances.VEs || 0}</div>
                  <div className="profile-stat-label">VE Points (VEs)</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="profile-stat-card balance-card-sve">
                <div className="profile-stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="profile-stat-value">{balances.SVEs || 0}</div>
                  <div className="profile-stat-label">Super VEs (SVEs)</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="profile-stat-card balance-card-tokens">
                <div className="profile-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="profile-stat-value">{balances.Tokens || 0}</div>
                  <div className="profile-stat-label">Platform Tokens</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Quick Stats */}
        <div className="mb-4">
          <h2 className="section-title mb-3" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Activity <span className="text-gradient">Overview</span>
          </h2>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-color)' }}>
                  <Trophy size={22} />
                </div>
                <div>
                  <div className="profile-stat-value">{stats.totalParticipations}</div>
                  <div className="profile-stat-label">Total Participations</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                  <Wallet size={22} />
                </div>
                <div>
                  <div className="profile-stat-value">{stats.totalVesSpent} VEs</div>
                  <div className="profile-stat-label">Total Entry Fees Paid</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
