/**
 * Quiz streak - consecutive days with at least one completed quiz.
 *
 * Stored in AsyncStorage as { lastDay: 'YYYY-MM-DD', days: N }.
 * recordQuizDay() is idempotent per day; a gap of 1 day continues the
 * streak, a longer gap resets to 1.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const QUIZ_STREAK_KEY = 'civic.quizStreak.v1';

function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getQuizStreak() {
  try {
    const raw = await AsyncStorage.getItem(QUIZ_STREAK_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const days = Number(parsed?.days || 0);
    if (!days) return 0;
    // If the last activity was more than 1 day ago, the streak is broken
    // (shown as 0 until the next quiz day).
    const last = parsed?.lastDay;
    if (!last) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    const delta = Math.floor((new Date(dayKey()).getTime() - new Date(last).getTime()) / msPerDay);
    return delta <= 1 ? days : 0;
  } catch {
    return 0;
  }
}

export async function recordQuizDay(date = new Date()) {
  try {
    const today = dayKey(date);
    const raw = await AsyncStorage.getItem(QUIZ_STREAK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const lastDay = parsed?.lastDay || null;
    if (lastDay === today) return Number(parsed?.days || 1); // already counted
    const msPerDay = 24 * 60 * 60 * 1000;
    let days = 1;
    if (lastDay) {
      const delta = Math.floor((new Date(today).getTime() - new Date(lastDay).getTime()) / msPerDay);
      days = delta === 1 ? Number(parsed?.days || 0) + 1 : 1;
    }
    await AsyncStorage.setItem(QUIZ_STREAK_KEY, JSON.stringify({ lastDay: today, days }));
    return days;
  } catch {
    return 0;
  }
}
