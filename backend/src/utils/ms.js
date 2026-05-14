/**
 * Convert a simple duration string to milliseconds.
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 * e.g. ms('7d') → 604800000
 */
function ms(str) {
  const match = String(str).match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return n * unit;
}

module.exports = ms;