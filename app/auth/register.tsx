import React, { useState, useMemo } from 'react';
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
  empty:  { label: '',        color: '#2D3148', bars: 0 },
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
              { backgroundColor: i <= config.bars ? config.color : '#2D3148' },
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
  bar: { flex: 1, height: 4, borderRadius: 2 },
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>💎</Text>
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
              placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
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
            {/* Indicador de fortaleza */}
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
                placeholderTextColor="#9CA3AF"
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
            {/* Indicador de coincidencia */}
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
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>
            }
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1117' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 36, fontWeight: '800', color: '#58CC02', letterSpacing: 1 },
  logoSub: { fontSize: 13, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#1A1D27',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2D3148',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  errorText: {
    backgroundColor: '#FF4B4B20',
    color: '#FF4B4B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#9CA3AF', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#0F1117',
    borderWidth: 1,
    borderColor: '#2D3148',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1117',
    borderWidth: 1,
    borderColor: '#2D3148',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
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
  matchText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  btnPrimary: {
    backgroundColor: '#58CC02',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnSecondary: { marginTop: 16, alignItems: 'center' },
  btnSecondaryText: { color: '#9CA3AF', fontSize: 14 },
  link: { color: '#58CC02', fontWeight: '700' },
  note: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
