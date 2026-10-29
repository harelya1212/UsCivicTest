/**
 * DailyChallengeCard - appointment mechanic.
 *
 * One 10-question challenge per day. A live countdown to midnight creates
 * urgency ("come back tomorrow"), and completing it posts to the squad
 * leaderboard. Stored per calendar date in AsyncStorage.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from './ui/Card';
import { colors, radius, spacing, typography } from '../theme';

export const DAILY_CHALLENGE_KEY = 'civic.dailyChallenge.v1';

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function isDailyChallengeDone(date = new Date()) {
  try {
    const raw = await AsyncStorage.getItem(DAILY_CHALLENGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.date === todayKey(date) && parsed?.completed === true;
  } catch {
    return false;
  }
}

export async function markDailyChallengeDone(date = new Date()) {
  try {
    await AsyncStorage.setItem(
      DAILY_CHALLENGE_KEY,
      JSON.stringify({ date: todayKey(date), completed: true })
    );
  } catch {}
}

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, midnight - now);
}

function formatCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function DailyChallengeCard({ onPress, style }) {
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState(msUntilMidnight());

  useEffect(() => {
    let mounted = true;
    isDailyChallengeDone().then((v) => mounted && setDone(v));
    const id = setInterval(() => {
      if (!mounted) return;
      const ms = msUntilMidnight();
      setRemaining(ms);
      // Rolled over to a new day - reset completion state
      if (ms > 23 * 3600 * 1000) {
        isDailyChallengeDone().then((v) => mounted && setDone(v));
      }
    }, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Card onPress={done ? undefined : onPress} style={[styles.card, done && styles.cardDone, style]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, done && styles.iconWrapDone]}>
          <MaterialCommunityIcons
            name={done ? 'check-circle' : 'calendar-star'}
            size={30}
            color={done ? colors.success : colors.gold}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {done ? "Today's challenge done!" : "Today's challenge"}
          </Text>
          <Text style={styles.sub}>
            {done
              ? 'Come back tomorrow for a new one.'
              : '10 questions. Beat your squad. New challenge in '}
            {!done && <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>}
          </Text>
        </View>
        {!done && (
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.border} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  cardDone: {
    borderColor: colors.success,
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconWrapDone: {
    backgroundColor: colors.successLight,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: typography.bold,
    fontFamily: typography.fontBold,
    color: colors.text,
  },
  sub: {
    fontSize: typography.caption,
    fontWeight: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countdown: {
    fontWeight: '800',
    color: colors.warning || colors.gold,
    fontVariant: ['tabular-nums'],
  },
});
