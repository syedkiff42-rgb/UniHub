require('dotenv').config();

module.exports = {
  secret:           process.env.JWT_SECRET              || 'dev_secret',
  expiresIn:        process.env.JWT_EXPIRES_IN          || '15m',
  refreshSecret:    process.env.JWT_REFRESH_SECRET      || 'dev_refresh_secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN  || '7d',
};