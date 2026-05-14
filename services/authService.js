import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './config';

// ── Auto-refreshing fetch wrapper ─────────────────────────────
async function apiFetch(url, options = {}) {
  const token = await AsyncStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // If token expired, try to refresh and retry once
  if (response.status === 401) {
    const body = await response.json();
    if (body.code === 'TOKEN_EXPIRED') {
      try {
        const newToken = await AuthService.refreshToken();
        // Retry with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } catch (_) {
        // Refresh failed — force logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  return response;
}

const AuthService = {

  // ── Register ───────────────────────────────────────────────
  async register({ name, email, password, student_id }) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, student_id }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // ── Login ──────────────────────────────────────────────────
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    await AsyncStorage.setItem('accessToken',  data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    await AsyncStorage.setItem('user',         JSON.stringify(data.user));

    return data;
  },

  // ── Logout ─────────────────────────────────────────────────
  async logout() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (_) {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  // ── Get stored user ────────────────────────────────────────
  async getUser() {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ── Get access token ───────────────────────────────────────
  async getToken() {
    return await AsyncStorage.getItem('accessToken');
  },

  // ── Refresh access token ───────────────────────────────────
  async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token.');

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    await AsyncStorage.setItem('accessToken',  data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);

    return data.accessToken;
  },

  // ── Check if logged in ─────────────────────────────────────
  async isLoggedIn() {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },

};

export { AuthService, apiFetch };