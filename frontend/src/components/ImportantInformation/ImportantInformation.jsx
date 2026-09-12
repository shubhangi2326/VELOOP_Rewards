import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const ImportantInformation = ({ info }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  if (!info || info.length === 0) return null;

  return (
    <div>
      <div className="imp-info-header">
        <AlertCircle size={20} style={{ color: 'var(--accent-gold)' }} />
        <h3>Important Information</h3>
      </div>
      <div className="imp-accordion">
        {info.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`imp-accordion-item ${isOpen ? 'open' : ''}`}>
              <button className="imp-accordion-btn" onClick={() => toggle(i)} aria-expanded={isOpen}>
                <span>{item.title}</span>
                <span className="imp-accordion-icon">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              <div className="imp-accordion-content" hidden={!isOpen}>
                <div className="imp-accordion-inner">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportantInformation;
