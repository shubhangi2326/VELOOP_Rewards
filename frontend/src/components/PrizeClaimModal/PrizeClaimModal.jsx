import React, { useState } from 'react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import styles from './PrizeClaimModal.module.css';

const PrizeClaimModal = ({ giveawayId, prize, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    emailAddress: ''
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
      if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) return 'Please enter a valid phone number (at least 10 digits).';
      if (!formData.address.trim()) return 'Complete Address is required.';
      if (!formData.city.trim()) return 'City is required.';
      if (!formData.state.trim()) return 'State is required.';
      if (!/^\d{5,6}$/.test(formData.pinCode)) return 'Please enter a valid 5 or 6 digit PIN code.';
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const claimData = {
      claimType: prize.type,
      prizeId: prize.id,
      ...formData
    };

    try {
      await api.submitClaim(giveawayId, claimData);
      onSuccess();
    } catch (err) {
      console.error("Claim submission failed:", err);
      let errorMessage = 'Failed to submit claim. Please try again later.';
      if (err.error === 'NOT_A_WINNER') errorMessage = 'You are not eligible to claim this prize.';
      else if (err.error === 'CLAIM_EXPIRED') errorMessage = 'The claim window for this prize has expired.';
      else if (err.error === 'ALREADY_CLAIMED') errorMessage = 'This prize has already been claimed.';
      else if (err.error === 'INVALID_DATA') errorMessage = 'Please check the information provided and try again.';
      else if (err.status === 401 || err.status === 403) errorMessage = 'Your session has expired. Please log in again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose} disabled={loading} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.iconWrapper}>
            <Gift size={24} aria-hidden="true" />
          </div>
          <h3 id="modal-title" className="mt-3 mb-1">Claim Your Prize</h3>
          <p className="text-muted">You won {prize.name}!</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-4 p-2" role="alert">
            <AlertCircle size={16} className="me-2" />
            <small>{error}</small>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.claimForm}>
          {isPhysical ? (
            <>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label text-muted small">Full Name</label>
                <input required id="fullName" type="text" className="form-control bg-dark text-light border-secondary" name="fullName" value={formData.fullName} onChange={handleChange} disabled={loading} />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label text-muted small">Phone Number</label>
                <input required id="phoneNumber" type="tel" className="form-control bg-dark text-light border-secondary" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={loading} placeholder="e.g. 9876543210" />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label text-muted small">Complete Address</label>
                <textarea required id="address" className="form-control bg-dark text-light border-secondary" name="address" rows="2" value={formData.address} onChange={handleChange} disabled={loading}></textarea>
              </div>
              <div className="row">
                <div className="col-4 mb-3">
                  <label htmlFor="city" className="form-label text-muted small">City</label>
                  <input required id="city" type="text" className="form-control bg-dark text-light border-secondary" name="city" value={formData.city} onChange={handleChange} disabled={loading} />
                </div>
                <div className="col-4 mb-3">
                  <label htmlFor="state" className="form-label text-muted small">State</label>
                  <input required id="state" type="text" className="form-control bg-dark text-light border-secondary" name="state" value={formData.state} onChange={handleChange} disabled={loading} />
                </div>
                <div className="col-4 mb-3">
                  <label htmlFor="pinCode" className="form-label text-muted small">PIN</label>
                  <input required id="pinCode" type="text" className="form-control bg-dark text-light border-secondary" name="pinCode" value={formData.pinCode} onChange={handleChange} disabled={loading} placeholder="e.g. 100001" />
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label htmlFor="emailAddress" className="form-label text-muted small">Email Address</label>
              <input required id="emailAddress" type="email" placeholder="Where should we send your gift card?" className="form-control bg-dark text-light border-secondary" name="emailAddress" value={formData.emailAddress} onChange={handleChange} disabled={loading} />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting claim...
              </>
            ) : (
              'Submit Claim'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrizeClaimModal;
