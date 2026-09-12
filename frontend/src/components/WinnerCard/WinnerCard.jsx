import React from 'react';
import { Trophy, Calendar } from 'lucide-react';

const WinnerCard = ({ winner, prize }) => {
  const winnerDate = new Date(winner.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  // Use inline prize details from enriched backend response (primary)
  // Fall back to prize prop for any other usage context
  const prizeName = winner.prizeName || prize?.name || null;
  const prizeImage = winner.prizeImage || prize?.image || null;

  return (
    <div className="winner-card">
      <div className="winner-card-img-wrap">
        {prizeImage ? (
          <img src={prizeImage} alt={prizeName || 'Prize'} className="winner-card-img" />
        ) : (
          <div className="winner-card-placeholder">
            <Trophy size={48} />
          </div>
        )}
      </div>
      <div className="winner-card-body">
        <div className="winner-badge">
          <Trophy size={13} /> Winner
        </div>
        <h3 className="winner-user-id">{winner.maskedUserId}</h3>
        <p className="winner-prize-name">Won: <strong>{prizeName || 'Unknown Prize'}</strong></p>
        <div className="winner-date">
          <Calendar size={14} />
          <span>{winnerDate}</span>
        </div>
      </div>
    </div>
  );
};

export default WinnerCard;

