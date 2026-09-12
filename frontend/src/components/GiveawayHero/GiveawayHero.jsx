import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Sparkles, ArrowRight, Star, Zap, Gift, Crown } from 'lucide-react';

/* -------------------------------------------------------------------
   All layout & visual styles use global utility classes from index.css
   and inline styles only — NO CSS module is used for the new visuals.
   ------------------------------------------------------------------- */

const floatVariants = {
  float: (delay = 0) => ({
    y: [0, -18, 0],
    rotate: [0, 3, 0],
    transition: { duration: 5 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay },
  }),
};

const particleData = [
  { Icon: Trophy,  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',   size: 28, style: { top: '8%',  left: '18%' },  delay: 0   },
  { Icon: Crown,   color: '#818cf8', glow: 'rgba(129,140,248,0.5)',   size: 24, style: { top: '22%', right: '12%' }, delay: 0.8 },
  { Icon: Gift,    color: '#34d399', glow: 'rgba(52,211,153,0.5)',    size: 26, style: { top: '68%', left: '10%' },  delay: 1.4 },
  { Icon: Zap,     color: '#f472b6', glow: 'rgba(244,114,182,0.5)',   size: 22, style: { top: '75%', right: '16%' }, delay: 2   },
  { Icon: Star,    color: '#38bdf8', glow: 'rgba(56,189,248,0.5)',    size: 20, style: { top: '48%', left: '5%' },   delay: 0.4 },
  { Icon: Sparkles,color: '#c084fc', glow: 'rgba(192,132,252,0.5)',   size: 18, style: { top: '40%', right: '5%' },  delay: 1.8 },
];

const GiveawayHero = () => {
  const scrollToGiveaways = () => {
    document.getElementById('featured-giveaways')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      {/* Animated Gradient Orbs */}
      <div className="hero-bg-orbs">
        <motion.div
          className="hero-orb hero-orb-1"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-orb hero-orb-2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="hero-orb hero-orb-3"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="container hero-container">
        <div className="row align-items-center">
          {/* ── Left: Headline & CTA ─────────────────────────────── */}
          <div className="col-lg-6 mb-5 mb-lg-0">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge */}
              <motion.div
                className="hero-badge"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Sparkles size={16} className="hero-badge-icon" />
                <span>Premium Giveaway Platform</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Win Exclusive
                <br />
                <span className="text-gradient">Premium Prizes</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                Join the most transparent and rewarding giveaway platform.
                Use your VEs to enter for a chance to win extraordinary prizes, every single week.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="hero-cta-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <motion.button
                  className="hero-btn-primary"
                  onClick={scrollToGiveaways}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Winning <ArrowRight size={20} />
                </motion.button>
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/signup" className="hero-btn-secondary">
                    Join Free
                  </Link>
                </motion.span>
              </motion.div>

              {/* Social proof strip */}
              <motion.div
                style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div style={{ display: 'flex', marginRight: '0.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" style={{ marginRight: '1px' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Trusted by <strong style={{ color: 'white' }}>thousands</strong> of winners
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Right: Abstract Premium Visual Stage ─────────────── */}
          <div className="col-lg-6">
            <motion.div
              className="hero-visual-stage"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Floating Particle Icons */}
              {particleData.map(({ Icon, color, glow, size, style, delay }, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    position: 'absolute',
                    ...style,
                    width: size * 2.4 + 'px',
                    height: size * 2.4 + 'px',
                    background: `radial-gradient(circle, ${color}20 0%, ${color}08 100%)`,
                    border: `1px solid ${color}40`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 0 20px ${glow}, inset 0 1px 1px rgba(255,255,255,0.2)`,
                    zIndex: 10,
                  }}
                  custom={delay}
                  animate="float"
                  variants={floatVariants}
                  whileHover={{ scale: 1.15 }}
                >
                  <Icon size={size} color={color} />
                </motion.div>
              ))}

              {/* Central Glass Pedestal Panel */}
              <motion.div
                className="hero-glass-pedestal"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Central Reward Icon */}
                <motion.div
                  className="hero-central-icon"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 100, height: 100, borderRadius: 28 }}
                >
                  {/* Inner crown stays upright while box rotates */}
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Trophy size={48} color="white" />
                  </motion.div>
                </motion.div>

                {/* Inner content */}
                <motion.div
                  style={{ textAlign: 'center', padding: '0 1.5rem' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="hero-card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    VELOOP Rewards
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Exclusive giveaways, every week
                  </div>

                  {/* Mini stat pills inside the glass card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    {[
                      { label: 'Total Prizes', value: '50+', color: '#fbbf24' },
                      { label: 'Winners',      value: '120+', color: '#34d399' },
                      { label: 'VEs Pool',     value: '10K', color: '#818cf8' },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '0.75rem',
                          padding: '0.6rem 1rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Ambient ring behind the glass panel */}
              <motion.div
                style={{
                  position: 'absolute',
                  width: 380,
                  height: 380,
                  borderRadius: '50%',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  zIndex: 0,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  width: 460,
                  height: 460,
                  borderRadius: '50%',
                  border: '1px dashed rgba(139, 92, 246, 0.1)',
                  zIndex: 0,
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiveawayHero;
