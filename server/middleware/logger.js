const requestLogger = (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
  }
  next();
};

module.exports = requestLogger;
