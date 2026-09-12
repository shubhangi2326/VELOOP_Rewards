import React from 'react';
import { motion } from 'framer-motion';

const HowToParticipate = ({ steps }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <section className="htp-section">
      <div className="container text-center">
        <div className="section-label" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Process</div>
        <h2 className="section-heading">How to <span className="text-gradient">Participate?</span></h2>
        <p className="section-subtext">Getting started with VELOOP is quick and easy.</p>
        <div className="row g-4">
          {steps.map((item, i) => (
            <div key={i} className="col-6 col-md-3">
              <motion.div
                className="htp-step-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="htp-step-number">{item.step}</div>
                <h4 className="htp-step-title">{item.title}</h4>
                <p className="htp-step-desc">{item.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToParticipate;
