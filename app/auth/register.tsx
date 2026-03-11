import React, { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/context/GameContext';

// ─── Fortaleza de contraseña ──────────────────────────────────────────────────

type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';

function getPasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) return 'empty';
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [pwd.length >= 4, hasLength, hasUpper || hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return 'weak';
  if (score === 2) return 'medium';
  return 'strong';
}

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bars: number }> = {
  empty:  { label: '',        color: 'rgba(255,255,255,0.1)', bars: 0 },
  weak:   { label: 'Débil',   color: '#FF4B4B', bars: 1 },
  medium: { label: 'Media',   color: '#FF9600', bars: 2 },
  strong: { label: 'Fuerte',  color: '#58CC02', bars: 3 },
};

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const config = STRENGTH_CONFIG[strength];

  if (!password) return null;

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              strengthStyles.bar,
              { backgroundColor: i <= config.bars ? config.color : 'rgba(255,255,255,0.1)' },
            ]}
          />
        ))}
      </View>
      {config.label ? (
        <Text style={[strengthStyles.label, { color: config.color }]}>{config.label}</Text>
      ) : null}
    </View>
  );
}

const strengthStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 5, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '700', width: 48, textAlign: 'right' },
});

// ─── Pantalla de Registro ─────────────────────────────────────────────────────

export default function RegisterScreen() {
  const { register } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !password2.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Error al registrarse');
    }
  };

  return (
    <LinearGradient
      colors={['#0A0A14', '#12082A', '#0A0A14']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Text style={styles.logoEmoji}>💎</Text>
            </LinearGradient>
            <Text style={styles.logoText}>Gemlish</Text>
            <Text style={styles.logoSub}>¡Crea tu cuenta y empieza a aprender!</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Crear Cuenta</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 3 caracteres"
                placeholderTextColor="#6B7280"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(v => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
              <PasswordStrengthBar password={password} />
              {password.length > 0 && password.length < 4 && (
                <Text style={styles.hintText}>Usa al menos 4 caracteres. Para mayor seguridad, agrega números o mayúsculas.</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#6B7280"
                  value={password2}
                  onChangeText={setPassword2}
                  secureTextEntry={!showPassword2}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword2(v => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword2 ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
              {password2.length > 0 && (
                <Text style={[styles.matchText, { color: password === password2 ? '#58CC02' : '#FF4B4B' }]}>
                  {password === password2 ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ['#4B2D8A', '#4B2D8A'] : ['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnPrimaryText}>Crear Cuenta 🚀</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => router.back()}
            >
              <Text style={styles.btnSecondaryText}>¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Tu progreso se guarda localmente en este dispositivo.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: { fontSize: 38 },
  logoText: {
    fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1,
    textShadowColor: 'rgba(124,58,237,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  logoSub: { fontSize: 13, color: '#A78BFA', marginTop: 6, textAlign: 'center', fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 24, textAlign: 'center' },
  errorText: {
    backgroundColor: '#FF4B4B20',
    color: '#FF6B6B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FF4B4B40',
  },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, color: '#A78BFA', marginBottom: 8, fontWeight: '700', letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: 14,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: { fontSize: 18 },
  hintText: { fontSize: 11, color: '#9CA3AF', marginTop: 6, lineHeight: 16 },
  matchText: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  btnPrimary: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  btnGradient: {
    padding: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  btnSecondary: { marginTop: 20, alignItems: 'center' },
  btnSecondaryText: { color: '#9CA3AF', fontSize: 14 },
  link: { color: '#A78BFA', fontWeight: '700' },
  note: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
