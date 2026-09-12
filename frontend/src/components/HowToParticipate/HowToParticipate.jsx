import React from 'react';
import styles from './HowToParticipate.module.css';

const HowToParticipate = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container text-center">
        <h2 className="mb-5">How to Participate?</h2>
        <div className="row g-4">
          {steps.map((item, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>{item.step}</div>
                <h4 className={styles.stepTitle}>{item.title}</h4>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToParticipate;
