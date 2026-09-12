import React from 'react';
import { Eye, ShieldCheck, Scale, Gift } from 'lucide-react';
import styles from './TrustSection.module.css';

const IconMap = {
  Eye,
  ShieldCheck,
  Scale,
  Gift
};

const TrustSection = ({ points }) => {
  if (!points || points.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className={styles.title}>Why Trust VELOOP?</h2>
          <p className={styles.subtitle}>Our platform is built on transparency and security.</p>
        </div>
        
        <div className="row g-4 justify-content-center">
          {points.map((point, idx) => {
            const Icon = IconMap[point.icon] || ShieldCheck;
            return (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div className={styles.trustCard}>
                  <div className={styles.iconWrapper}>
                    <Icon size={28} className={styles.icon} aria-hidden="true" />
                  </div>
                  <h4 className={styles.cardTitle}>{point.title}</h4>
                  <p className={styles.cardDesc}>{point.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
