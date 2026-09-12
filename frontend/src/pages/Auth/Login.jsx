import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      const state = location.state || {};
      navigate(state?.returnTo || '/giveaways');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <motion.h1 className="auth-visual-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            Welcome Back to <br /><span className="text-gradient">VELOOP</span>
          </motion.h1>
          <motion.p className="auth-visual-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}>
            Log in to manage your giveaways, view your winnings, and participate in exclusive premium rewards.
          </motion.p>
        </div>
        <div className="auth-float-card" />
      </div>

      <div className="auth-form-side">
        <motion.div className="auth-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Enter your credentials to continue</p>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} /><span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
                <Mail size={18} className="auth-input-icon" />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <input className="auth-input" type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <Lock size={18} className="auth-input-icon" />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? <><Loader2 size={20} style={{ animation: 'spin 0.75s linear infinite' }} /> Signing In...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?<Link to="/signup">Create account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
