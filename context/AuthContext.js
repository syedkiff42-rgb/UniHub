import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Check login state on app start ────────────────────────
  useEffect(() => {
    async function checkAuth() {
      try {
        const loggedIn = await AuthService.isLoggedIn();
        if (loggedIn) {
          const storedUser = await AuthService.getUser();
          setUser(storedUser);
        }
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // ── Login ─────────────────────────────────────────────────
  async function login(email, password) {
    const data = await AuthService.login(email, password);
    setUser(data.user);
    return data;
  }

  // ── Register ──────────────────────────────────────────────
  async function register(payload) {
    const data = await AuthService.register(payload);
    return data;
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    await AuthService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}