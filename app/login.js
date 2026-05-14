import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [tab,       setTab]       = useState('login');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [name,      setName]      = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showPass,  setShowPass]  = useState(false);

  // Shake animation
  const shakeX = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10,  duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: 6,   duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: -6,  duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeX, { toValue: 0,   duration: 40, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit() {
  setError('');

  if (!email.trim() || !password.trim()) {
    setError('Email and password are required.');
    shake();
    return;
  }
  if (tab === 'register' && !name.trim()) {
    setError('Please enter your full name.');
    shake();
    return;
  }

  setLoading(true);
  try {
    if (tab === 'login') {
      await login(email.trim().toLowerCase(), password);
      router.replace('/');
    } else {
      await register({
        name:       name.trim(),
        email:      email.trim().toLowerCase(),
        password,
        student_id: studentId.trim() || undefined,
      });
      // After register → go to login tab, don't auto-login
      setTab('login');
      setName('');
      setStudentId('');
      setPassword('');
      setError('');
      Alert.alert('Account Created! 🎉', 'You can now sign in with your email and password.');
    }
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
    shake();
  } finally {
    setLoading(false);
  }
}

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        {/* Brand */}
        <View style={s.brand}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>U</Text>
          </View>
          <Text style={s.appName}>UniHub</Text>
          <Text style={s.tagline}>Your academic command center</Text>
        </View>

        {/* Card */}
        <Animated.View style={[s.card, { transform: [{ translateX: shakeX }] }]}>

          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tabBtn, tab === 'login' && s.tabBtnActive]}
              onPress={() => { setTab('login'); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tabBtn, tab === 'register' && s.tabBtnActive]}
              onPress={() => { setTab('register'); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, tab === 'register' && s.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Register only fields */}
          {tab === 'register' && (
            <>
              <Text style={s.label}>Full Name</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Syed Zulkifli"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              <Text style={s.label}>
                Student ID <Text style={s.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.input}
                placeholder="e.g. 52213224368"
                placeholderTextColor="#888"
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </>
          )}

          {/* Common fields */}
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="student@university.edu.my"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={s.label}>Password</Text>
          <View style={s.passRow}>
            <TextInput
              style={[s.input, s.passInput]}
              placeholder={tab === 'register' ? 'Min 6 characters' : '••••••••'}
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={s.eyeBtn}
              onPress={() => setShowPass(v => !v)}
              activeOpacity={0.7}
            >
              <Text style={s.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠ {error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={s.submitText}>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
            }
          </TouchableOpacity>

          {/* Forgot password */}
          {tab === 'login' && (
            <TouchableOpacity style={s.forgotBtn} activeOpacity={0.7}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

        </Animated.View>

        <Text style={s.footer}>UniHub © 2025 · FYP Project</Text>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#f5f5f5' },
  kav:   { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  // Brand
  brand:   { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: '#7C5CBF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7C5CBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  logoText: { fontSize: 36, fontWeight: '900', color: 'white' },
  appName:  { fontSize: 28, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  tagline:  { fontSize: 13, color: '#888', marginTop: 4 },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1, borderColor: '#e0e0e0',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },

  // Tabs
  tabs:          { flexDirection: 'row', marginBottom: 22, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4 },
  tabBtn:        { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabBtnActive:  { backgroundColor: '#7C5CBF' },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive: { color: 'white' },

  // Form
  label:    { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  optional: { fontWeight: '400', textTransform: 'none' },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: '#1a1a1a',
    marginBottom: 16,
  },

  passRow:   { position: 'relative' },
  passInput: { paddingRight: 52 },
  eyeBtn:    { position: 'absolute', right: 14, top: 13 },
  eyeIcon:   { fontSize: 18 },

  // Error
  errorBox: {
    backgroundColor: 'rgba(232,96,76,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,96,76,0.35)',
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: '#e8604c', fontWeight: '500' },

  // Submit
  submitBtn: {
    backgroundColor: '#7C5CBF',
    borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#7C5CBF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: 'white', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  forgotBtn:  { alignItems: 'center', marginTop: 14 },
  forgotText: { fontSize: 13, color: '#7C5CBF' },

  footer: { textAlign: 'center', marginTop: 24, fontSize: 11, color: '#aaa' },
});