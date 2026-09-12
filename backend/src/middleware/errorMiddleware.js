const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific MongoDB errors
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      error: 'ALREADY_PARTICIPATING',
      message: 'You are already participating in this giveaway.'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name === 'Error' ? 'API_ERROR' : err.name,
    message: err.message || 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = errorMiddleware;
