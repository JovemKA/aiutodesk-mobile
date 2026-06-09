import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import { Theme } from '@/theme';

export default function LoginScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Não foi possível entrar.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>AiutoDesk</Text>
            <Text style={styles.tagline}>Suporte inteligente no seu bolso</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@empresa.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton label="Entrar" onPress={handleSubmit} loading={submitting} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Link href="/(auth)/signup" style={styles.link}>
              Criar conta
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    brand: { alignItems: 'center', gap: theme.spacing.xs },
    logo: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xxl,
      color: theme.colors.primary,
    },
    tagline: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    form: { gap: theme.spacing.md },
    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    footerText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    link: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });
