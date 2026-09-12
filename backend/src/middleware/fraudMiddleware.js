const FraudEvent = require('../models/FraudEvent');
const GiveawayParticipation = require('../models/GiveawayParticipation');
const crypto = require('crypto');

// Middleware to evaluate suspicious activity based on simple heuristics
const fraudMiddleware = async (req, res, next) => {
  try {
    const clientDeviceHash = req.body.deviceHash;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const userAgent = req.headers['user-agent'] || 'unknown-ua';
    const giveawayId = req.params.id || req.body.giveawayId;
    const userId = req.user ? req.user.id : null;
    
    // Create a server-side fingerprint that cannot be spoofed easily
    const serverFingerprint = crypto.createHash('sha256').update(`${ipAddress}-${userAgent}`).digest('hex');
    // Use the server fingerprint as the definitive device hash for fraud checks
    const deviceHash = serverFingerprint;

    let riskScore = 0;
    const signals = [];

    if (!clientDeviceHash) {
      riskScore += 20;
      signals.push('missing_client_device_hash');
    } else if (userId && giveawayId) {
      // Check for multi-account abuse: Has another user used this deviceHash for this giveaway?
      const existingParticipations = await GiveawayParticipation.find({ 
        giveawayId, 
        deviceHash 
      }).lean();

      // If we find participations from a DIFFERENT user ID with the same deviceHash
      const otherUsers = existingParticipations.filter(p => p.userId.toString() !== userId.toString());
      
      if (otherUsers.length > 0) {
        riskScore += 100;
        signals.push('multi_account_device');
      }
    }

    // Example logic: if riskScore is CRITICAL, block immediately.
    if (riskScore >= 80) {
      // Log fraud event
      const fraudEvent = await FraudEvent.create({
        userId: userId,
        giveawayId: giveawayId,
        deviceHash,
        riskScore,
        reason: `Suspicious request pattern: ${signals.join(', ')}`,
        action: 'BLOCKED'
      });

      const AuditLog = require('../models/AuditLog');
      const auditLog = new AuditLog({
        userId,
        action: 'FRAUD_FLAGGED',
        details: {
          giveawayId,
          deviceHash,
          riskScore,
          fraudEventId: fraudEvent._id
        },
        ipAddress
      });
      await auditLog.save();

      return res.status(403).json({
        error: 'SUSPICIOUS_ACTIVITY',
        message: 'Participation couldn\'t be completed. We couldn\'t verify this request.'
      });
    }

    // Attach secure device hash and risk score to request for downstream controllers
    req.body.deviceHash = deviceHash;
    req.riskScore = riskScore;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = fraudMiddleware;
