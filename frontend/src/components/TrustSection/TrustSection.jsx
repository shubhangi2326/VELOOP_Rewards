import React from 'react';
import { Eye, ShieldCheck, Scale, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const IconMap = { Eye, ShieldCheck, Scale, Gift };

const TrustSection = ({ points }) => {
  if (!points || points.length === 0) return null;

  return (
    <section className="trust-section">
      <div className="container">
        <div className="text-center mb-5">
          <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Trust</div>
          <h2 className="section-heading">Why Trust <span className="text-gradient">VELOOP?</span></h2>
          <p className="section-subtext">Our platform is built on transparency and security.</p>
        </div>
        <div className="row g-4 justify-content-center">
          {points.map((point, idx) => {
            const Icon = IconMap[point.icon] || ShieldCheck;
            return (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <motion.div
                  className="trust-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                >
                  <div className="trust-icon-wrap">
                    <Icon size={28} />
                  </div>
                  <h4 className="trust-card-title">{point.title}</h4>
                  <p className="trust-card-desc">{point.desc}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
