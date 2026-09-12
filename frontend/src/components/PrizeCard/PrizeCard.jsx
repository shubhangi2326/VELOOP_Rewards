import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy, Sparkles, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import Countdown from '../Countdown/Countdown';

const badgeClass = (pos) => {
  if (pos === 1) return 'prize-card-position-badge badge-grand';
  if (pos === 2) return 'prize-card-position-badge badge-second';
  if (pos === 3) return 'prize-card-position-badge badge-third';
  return 'prize-card-position-badge badge-lucky';
};

const badgeLabel = (pos) => {
  if (pos === 1) return 'Grand Prize';
  if (pos === 2) return '2nd Prize';
  if (pos === 3) return '3rd Prize';
  return 'Lucky Draw';
};

const PrizeCard = ({ prize, giveawayId, participantsCount, endDate, status }) => {
  const isActive = status === 'active';
  const to = isActive
    ? `/giveaways/${giveawayId}/prize/${prize.id}`
    : `/giveaways/${giveawayId}/winners`;

  return (
    <motion.div className="prize-card" whileHover={{ y: -8 }} transition={{ duration: 0.35 }}>
      <div className={badgeClass(prize.position)}>
        {prize.position === 1 ? <Sparkles size={13} /> : <Trophy size={13} />}
        {badgeLabel(prize.position)}
      </div>

      <div className="prize-card-img-wrapper">
        {prize.image
          ? <img src={prize.image} alt={prize.name} className="prize-card-img" />
          : <div className="prize-card-img-placeholder"><Trophy size={52} /></div>
        }
        {isActive && endDate && (
          <div className="prize-card-countdown">
            <Timer size={13} />
            <Countdown targetDate={endDate} />
          </div>
        )}
      </div>

      <div className="prize-card-body">
        <h3 className="prize-card-title">{prize.name}</h3>
        <p className="prize-card-desc">{prize.description}</p>

        <div className="prize-card-meta">
          <div className="prize-card-meta-item" style={{ color: 'var(--primary-color)' }}>
            <Users size={14} /><span style={{ color: 'var(--text-subtle)' }}>{participantsCount}+ Participants</span>
          </div>
          <div className="prize-card-meta-item" style={{ color: 'var(--accent-gold)' }}>
            <Trophy size={14} /><span style={{ color: 'var(--text-subtle)' }}>{prize.winnerCount} {prize.winnerCount > 1 ? 'Winners' : 'Winner'}</span>
          </div>
        </div>

        <div className="prize-card-footer">
          <div>
            <div className="prize-card-fee-label">Entry Fee</div>
            <div className="prize-card-fee-value">
              {prize.entryFee}<span className="prize-card-fee-currency">{prize.entryCurrency}</span>
            </div>
          </div>
          <Link to={to} className={`prize-card-btn ${isActive ? 'prize-card-btn-join' : 'prize-card-btn-view'}`}>
            {isActive ? (<>Join Now <ArrowRight size={15} /></>) : status === 'ended' ? 'View Winners' : 'View Details'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PrizeCard;
