const mongoose = require('mongoose');

const queryLogger = (req, res, next) => {
  const start = Date.now();
  
  // Patch mongoose queries to measure performance
  // This is a simplified version, for production use a proper APM
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 500) { // Log warning for slow requests
      console.warn(`[PERF WARNING] ${req.method} ${req.originalUrl} took ${duration}ms`);
    } else {
      console.log(`[PERF] ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

module.exports = queryLogger;
