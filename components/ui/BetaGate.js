/**
 * BetaGate - closed-beta lock screen for the WEB build only.
 * Shows a code entry; on the correct code it persists acceptance in
 * AsyncStorage (localStorage on web) so the tester is not asked again in
 * that browser. Native builds never render this screen (App.js gates it).
 * Soft gate only: the code lives in the client bundle, so it keeps casual
 * visitors out but is not real security.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius } from '../../theme';
import { BETA_GATE_CODE, BETA_GATE_STORAGE_KEY } from '../../constants';

export default function BetaGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (String(code).trim() === BETA_GATE_CODE) {
      try {
        await AsyncStorage.setItem(BETA_GATE_STORAGE_KEY, 'ok');
      } catch (e) {
        // If storage fails, still unlock for this session.
      }
      setError('');
      onUnlock();
    } else {
      setError('Wrong code. Ask the person who sent you this link for the beta code.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>US Civic Test</Text>
        <Text style={styles.subtitle}>Closed beta</Text>
        <Text style={styles.text}>
          This is a private test version. Enter the beta code you received with the link.
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setError('');
          }}
          placeholder="Beta code"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={submit}
          accessibilityLabel="Beta code"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={submit} accessibilityRole="button" accessibilityLabel="Enter beta">
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
        <Text style={styles.note}>
          The code is remembered in this browser, so you only enter it once.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentDark,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 4,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  note: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
