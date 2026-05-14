const router     = require('express').Router();
const { body }   = require('express-validator');
const validate   = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl       = require('./authController');

// ── Register ──────────────────────────────────────────────────
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters.'),
  ],
  validate,
  ctrl.register
);

// ── Login ─────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  ctrl.login
);

// ── Refresh token ─────────────────────────────────────────────
router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('refreshToken required.'),
  validate,
  ctrl.refresh
);

// ── Logout ────────────────────────────────────────────────────
router.post('/logout', ctrl.logout);

// ── Me (protected) ────────────────────────────────────────────
router.get('/me', authenticate, ctrl.me);

module.exports = router;