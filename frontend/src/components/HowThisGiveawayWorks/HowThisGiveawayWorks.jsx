import React from 'react';
import { Search, CheckSquare, Wallet, ShieldCheck, Clock, PartyPopper, Gift } from 'lucide-react';

const IconMap = { Search, CheckSquare, Wallet, ShieldCheck, Clock, PartyPopper, Gift };

const HowThisGiveawayWorks = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;
  return (
    <div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
        <ShieldCheck size={20} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
        How This Giveaway Works
      </h3>
      <div className="htgw-timeline">
        {timeline.map((item, idx) => {
          const Icon = IconMap[item.icon] || ShieldCheck;
          return (
            <div key={idx} className="htgw-step">
              <div className="htgw-step-num"><Icon size={14} /></div>
              <div className="htgw-step-content" style={{ paddingLeft: '1.5rem' }}>
                <p className="htgw-step-title">{item.title}</p>
                <p className="htgw-step-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowThisGiveawayWorks;
