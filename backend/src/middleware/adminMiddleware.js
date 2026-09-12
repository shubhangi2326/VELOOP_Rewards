const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User not authenticated.' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
