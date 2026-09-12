import React, { useState } from 'react';
import { MOCK_PREVIOUS_WINNERS } from '../../data/mockData';

const WinnersTabs = ({ activeGiveaway }) => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="wtabs-container">
      <div className="wtabs-header">
        <button className={`wtab-btn ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
          Current Giveaway
        </button>
        <button className={`wtab-btn ${activeTab === 'previous' ? 'active' : ''}`} onClick={() => setActiveTab('previous')}>
          Previous Winners
        </button>
      </div>

      <div>
        {activeTab === 'current' ? (
          <div className="wtabs-empty">
            <h5>{activeGiveaway ? 'Giveaway is still live' : 'The next giveaway is being prepared'}</h5>
            <p className="text-muted">
              {activeGiveaway ? 'Winners will be announced after the giveaway ends.' : 'Stay tuned for more rewards.'}
            </p>
          </div>
        ) : (
          <div className="wtabs-winner-list">
            {MOCK_PREVIOUS_WINNERS.map(winner => (
              <div key={winner.id} className="wtabs-winner-card">
                <div className="wtabs-winner-info">
                  <div className="wtabs-avatar">{winner.maskedUserId.substring(0, 2)}</div>
                  <div>
                    <h6 className="mb-0">{winner.maskedUserId}</h6>
                    <small className="text-muted">Won: {winner.prize}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div className="wtabs-giveaway-name">{winner.giveaway}</div>
                  <small className="text-muted">{winner.date}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WinnersTabs;
