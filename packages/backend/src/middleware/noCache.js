// packages/backend/src/middleware/noCache.js (một file middleware)
module.exports = function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

// Sau đó đăng ký middleware trước các route API:
const noCache = require('./middleware/noCache');
app.use('/api', noCache);