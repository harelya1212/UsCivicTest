/**
 * ShareScoreCard - a screenshot-ready challenge card.
 *
 * Designed to look great as a shared screenshot on WhatsApp/Instagram:
 * big score, trophy, personal message, and the squad invite code so
 * friends can join with one tap. The viral loop: share -> friend joins
 * squad -> friend shares.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography, shadows } from '../theme';

const APP_LINK = 'https://harelya1212.github.io/UsCivicTest/';

function scoreEmoji(percentage) {
  if (percentage >= 90) return '🏆';
  if (percentage >= 70) return '🔥';
  if (percentage >= 50) return '💪';
  return '📚';
}

function scoreTitle(percentage) {
  if (percentage >= 90) return 'Test-day ready!';
  if (percentage >= 70) return 'Almost there!';
  if (percentage >= 50) return 'Keep pushing!';
  return 'Every master was a beginner.';
}

export function buildShareMessage({ percentage, inviteCode, userName }) {
  const name = userName ? `${userName} ` : '';
  const codeLine = inviteCode
    ? `\nJoin my study squad with code ${inviteCode} - let's compete daily!`
    : '';
  return `🏆 ${name}scored ${percentage}% on the US Civics test!${codeLine}\nThink you can beat me? ${APP_LINK}`;
}

export default function ShareScoreCard({ percentage, inviteCode, userName, style }) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark || '#1a2f6e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <Text style={styles.emoji}>{scoreEmoji(percentage)}</Text>
      <Text style={styles.score}>{percentage}%</Text>
      <Text style={styles.title}>{scoreTitle(percentage)}</Text>
      <Text style={styles.sub}>
        {userName ? `${userName} on the US Civics test` : 'US Civics test score'}
      </Text>
      {inviteCode ? (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>CHALLENGE ME - SQUAD CODE</Text>
          <Text style={styles.code}>{inviteCode}</Text>
        </View>
      ) : (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>STUDY SMARTER, TOGETHER</Text>
          <Text style={styles.codeSmall}>Civics Coach</Text>
        </View>
      )}
      <Text style={styles.link}>harelya1212.github.io/UsCivicTest</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  emoji: {
    fontSize: 52,
    marginBottom: spacing.xs,
  },
  score: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    fontFamily: typography.fontBold,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  sub: {
    fontSize: typography.body,
    fontWeight: typography.regular,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  codeBox: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 2,
  },
  code: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    color: colors.gold || '#FFD54A',
  },
  codeSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  link: {
    marginTop: spacing.md,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
