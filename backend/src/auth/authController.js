const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db     = require('../config/db');
const jwtCfg = require('../config/jwt');
const ms     = require('../utils/ms');

// ── Helper: issue access + refresh tokens ─────────────────────
function issueTokens(user) {
  const payload = { id: user.id, email: user.email, name: user.name };

  const accessToken = jwt.sign(payload, jwtCfg.secret, {
    expiresIn: jwtCfg.expiresIn,
  });

  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

// ── POST /api/auth/register ───────────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password, student_id, phone } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, student_id, phone) VALUES (?,?,?,?,?)',
      [name, email, hashed, student_id || null, phone || null]
    );

    const userId = result.insertId;
    const [rows] = await db.query(
      'SELECT id, name, email, student_id FROM users WHERE id = ?', [userId]
    );

    return res.status(201).json({ success: true, message: 'Account created.', user: rows[0] });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/auth/login ──────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const { accessToken, refreshToken } = issueTokens(user);

    const expiresAt = new Date(Date.now() + ms(jwtCfg.refreshExpiresIn));
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)',
      [user.id, refreshToken, expiresAt]
    );

    const { password: _p, ...safeUser } = user;

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: safeUser,
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }

    const [rows] = await db.query(
      `SELECT rt.*, u.id AS uid, u.name, u.email
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = ?`,
      [refreshToken]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      await db.query('DELETE FROM refresh_tokens WHERE id = ?', [record.id]);
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = issueTokens({
      id: record.uid, email: record.email, name: record.name,
    });

    const expiresAt = new Date(Date.now() + ms(jwtCfg.refreshExpiresIn));
    await db.query(
      'UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE id = ?',
      [newRefreshToken, expiresAt, record.id]
    );

    return res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('[refresh]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }
    return res.json({ success: true, message: 'Logged out.' });
  } catch (err) {
    console.error('[logout]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────
async function me(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, student_id, phone, gpa_target, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, refresh, logout, me };