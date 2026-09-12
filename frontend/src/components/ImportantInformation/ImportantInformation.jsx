import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import styles from './ImportantInformation.module.css';

const ImportantInformation = ({ info }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleInfo = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!info || info.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AlertCircle size={20} className="me-2 text-warning" aria-hidden="true" />
        <h3 className={styles.title}>Important Information</h3>
      </div>
      <div className={styles.accordion}>
        {info.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleInfo(index)}
                aria-expanded={isOpen}
                aria-controls={`info-content-${index}`}
              >
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.iconWrapper} aria-hidden="true">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              <div 
                id={`info-content-${index}`} 
                className={styles.accordionContent}
                hidden={!isOpen}
              >
                <div className={styles.contentInner}>
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportantInformation;
