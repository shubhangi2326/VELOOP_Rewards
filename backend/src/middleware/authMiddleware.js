const jwt = require('jsonwebtoken');

// A dummy authentication middleware for development.
// In a real scenario, this would verify the token against the JWT_SECRET and fetch the user.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Basic mock auth: we assume the token is just a JSON string of a mock user, or we decode it.
  // For development without a real auth server, if no token, we can mock a user or reject.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'LOGIN_REQUIRED', message: 'Please login to your VELOOP Rewards account before participating in this giveaway.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // If we have a secret, try verifying. If not, just decode.
    // For this mock implementation, we'll assume the frontend sends a signed JWT 
    // or we'll just mock the user context based on the token string for testing.
    let user;
    if (process.env.JWT_SECRET) {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } else {
      // Decode without verification for pure frontend mock testing if secret isn't set yet
      user = jwt.decode(token);
    }
    
    if (!user) {
      throw new Error('Invalid token');
    }
    
    req.user = user; // Should contain userId, etc.
    next();
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Your session is invalid or has expired.' });
  }
};

module.exports = authMiddleware;
