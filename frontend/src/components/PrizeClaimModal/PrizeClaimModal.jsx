import React, { useState } from 'react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const PrizeClaimModal = ({ giveawayId, prize, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', address: '', city: '', state: '', pinCode: '', emailAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isPhysical = prize.type === 'physical';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (isPhysical) {
      if (!formData.fullName.trim()) return 'Full Name is required.';
      if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) return 'Please enter a valid phone number.';
      if (!formData.address.trim()) return 'Complete Address is required.';
      if (!formData.city.trim()) return 'City is required.';
      if (!formData.state.trim()) return 'State is required.';
      if (!/^\d{5,6}$/.test(formData.pinCode)) return 'Please enter a valid PIN code.';
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true); setError('');
    try {
      await api.submitClaim(giveawayId, { claimType: prize.type, prizeId: prize.id, ...formData });
      onSuccess();
    } catch (err) {
      let msg = 'Failed to submit claim. Please try again later.';
      if (err.error === 'NOT_A_WINNER') msg = 'You are not eligible to claim this prize.';
      else if (err.error === 'CLAIM_EXPIRED') msg = 'The claim window has expired.';
      else if (err.error === 'ALREADY_CLAIMED') msg = 'This prize has already been claimed.';
      else if (err.error === 'INVALID_DATA') msg = 'Please check the information provided.';
      else if (err.status === 401 || err.status === 403) msg = 'Session expired. Please log in again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="claim-modal-overlay" role="dialog" aria-modal="true">
      <div className="claim-modal-box" style={{ position: 'relative' }}>
        <button className="claim-modal-close" onClick={onClose} disabled={loading} aria-label="Close">
          <X size={18} />
        </button>

        <div className="claim-modal-header">
          <div className="claim-modal-icon"><Gift size={24} /></div>
          <h3 style={{ marginBottom: '0.25rem' }}>Claim Your Prize</h3>
          <p style={{ color: 'var(--text-muted)' }}>You won {prize.name}!</p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /><small>{error}</small>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isPhysical ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label className="auth-label" htmlFor="fullName">Full Name</label>
                <input required id="fullName" type="text" className="auth-input" style={{ paddingLeft: '1rem' }} name="fullName" value={formData.fullName} onChange={handleChange} disabled={loading} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="auth-label" htmlFor="phoneNumber">Phone Number</label>
                <input required id="phoneNumber" type="tel" className="auth-input" style={{ paddingLeft: '1rem' }} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={loading} placeholder="e.g. 9876543210" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="auth-label" htmlFor="address">Address</label>
                <textarea required id="address" className="auth-input" style={{ paddingLeft: '1rem', minHeight: '70px', resize: 'vertical' }} name="address" value={formData.address} onChange={handleChange} disabled={loading} />
              </div>
              <div className="row">
                <div className="col-4" style={{ marginBottom: '1rem' }}>
                  <label className="auth-label" htmlFor="city">City</label>
                  <input required id="city" type="text" className="auth-input" style={{ paddingLeft: '1rem' }} name="city" value={formData.city} onChange={handleChange} disabled={loading} />
                </div>
                <div className="col-4" style={{ marginBottom: '1rem' }}>
                  <label className="auth-label" htmlFor="state">State</label>
                  <input required id="state" type="text" className="auth-input" style={{ paddingLeft: '1rem' }} name="state" value={formData.state} onChange={handleChange} disabled={loading} />
                </div>
                <div className="col-4" style={{ marginBottom: '1rem' }}>
                  <label className="auth-label" htmlFor="pinCode">PIN</label>
                  <input required id="pinCode" type="text" className="auth-input" style={{ paddingLeft: '1rem' }} name="pinCode" value={formData.pinCode} onChange={handleChange} disabled={loading} placeholder="100001" />
                </div>
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="auth-label" htmlFor="emailAddress">Email Address</label>
              <input required id="emailAddress" type="email" className="auth-input" style={{ paddingLeft: '1rem' }} name="emailAddress" value={formData.emailAddress} onChange={handleChange} disabled={loading} placeholder="Where should we send your gift card?" />
            </div>
          )}
          <button type="submit" className="claim-submit-btn" disabled={loading}>
            {loading ? (<><span className="spinner-border spinner-border-sm me-2" />Submitting...</>) : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrizeClaimModal;
