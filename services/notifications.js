/**
 * Push notifications service for UsCivicTest.
 *
 * Two kinds:
 * 1. Daily motivational nudge - once a day at a random afternoon/evening
 *    hour (14:00-19:00), personal and positive. Tapping opens the app.
 * 2. Squad updates - when something changes in the user's squad
 *    (someone overtakes them, a new member joins, a challenge starts).
 *
 * All local notifications (no push server needed). Web: expo-notifications
 * is not fully supported on web, so everything no-ops gracefully there.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Message pool: personal, positive, short ────────────────────────────────
const DAILY_MESSAGES = [
  { title: 'You are closer than you think 🎯', body: 'Just a few questions today and you are one step closer to passing.' },
  { title: 'Your future self says thanks 🙌', body: 'A quick 10-question drill now pays off on test day.' },
  { title: 'Keep the streak alive 🔥', body: 'Open the app and answer a few questions to stay sharp.' },
  { title: 'You have got this! 🇺🇸', body: 'Your civics knowledge is growing every day. Let us keep it going.' },
  { title: 'Small step, big win 🏆', body: 'One short practice session today. That is all it takes.' },
  { title: 'Remember why you started ✨', body: 'That test date is coming. A few minutes now makes all the difference.' },
  { title: 'Your brain loves a challenge 🧠', body: 'Ready for a quick quiz? Your weak spots are waiting for a rematch.' },
  { title: 'Almost there! 🚀', body: 'Every correct answer is a point toward your goal. Come grab a few.' },
];

const STORAGE_KEYS = {
  dailyScheduledDate: '@civic/dailyNotifDate',
  lastSquadScores: '@civic/lastSquadScores',
};

const isWeb = Platform.OS === 'web';

/** Random hour between 14:00 and 19:00, random minute. */
function randomAfternoonTime() {
  const hour = 14 + Math.floor(Math.random() * 6); // 14..19
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

function pickMessage() {
  return DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
}

/**
 * Ask the user for notification permission. Returns true if granted.
 * Safe to call repeatedly; only prompts once per OS rules.
 */
export async function requestNotificationPermission() {
  if (isWeb) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedule the daily motivational notification for tomorrow at a random
 * afternoon/evening time. Cancels any previously scheduled daily nudge
 * first, so there is ever at most one pending.
 */
export async function scheduleDailyNudge() {
  if (isWeb) return false;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    // Cancel previous daily nudges (identified by data.type)
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content?.data?.type === 'daily-nudge') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    const { hour, minute } = randomAfternoonTime();
    const msg = pickMessage();

    // Schedule for tomorrow at the random time (daily trigger repeats)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        data: { type: 'daily-nudge', screen: 'HomeTab' },
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await AsyncStorage.setItem(STORAGE_KEYS.dailyScheduledDate, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

/**
 * Squad update notifications. Call after a squad sync with the latest
 * leaderboard. Sends a notification only when something actually changed:
 * - someone overtook the user
 * - a new member joined
 * - the user dropped in rank
 * No notification when nothing changed (avoids spam).
 *
 * @param {Array} leaderboard - sorted desc by score [{id, name, score}]
 * @param {string} selfId - the current user's member id ('self')
 * @param {string} teamName - squad name for the message
 */
export async function notifySquadUpdates(leaderboard = [], selfId = 'self', teamName = 'your squad') {
  if (isWeb) return false;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
    if (!Array.isArray(leaderboard) || leaderboard.length < 2) return false;

    const prevRaw = await AsyncStorage.getItem(STORAGE_KEYS.lastSquadScores);
    const prev = prevRaw ? JSON.parse(prevRaw) : null;

    // Snapshot current scores for next comparison
    const snapshot = leaderboard.map((e) => ({ id: e.id, score: e.score || 0 }));
    await AsyncStorage.setItem(STORAGE_KEYS.lastSquadScores, JSON.stringify(snapshot));

    if (!prev) return false; // first sync, no baseline yet

    const prevById = {};
    for (const p of prev) prevById[p.id] = p.score;

    // New member joined?
    const newMembers = leaderboard.filter((e) => !(e.id in prevById) && e.id !== selfId);
    if (newMembers.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `New challenger in ${teamName}! 👋`,
          body: `${newMembers[0].name} just joined your squad. Show them what you have got!`,
          data: { type: 'squad-update', screen: 'FamilyTab' },
          sound: false,
        },
        trigger: null, // immediate
      });
      return true;
    }

    // Rank change for self?
    const sortedPrev = [...prev].sort((a, b) => b.score - a.score);
    const prevRank = sortedPrev.findIndex((p) => p.id === selfId);
    const newRank = leaderboard.findIndex((e) => e.id === selfId);
    if (prevRank >= 0 && newRank >= 0 && newRank !== prevRank) {
      if (newRank < prevRank) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'You moved up! 🎉',
            body: `You are now #${newRank + 1} in ${teamName}. Keep going!`,
            data: { type: 'squad-update', screen: 'FamilyTab' },
            sound: false,
          },
          trigger: null,
        });
      } else {
        const overtaker = leaderboard[newRank - 1];
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${overtaker?.name || 'Someone'} just passed you! 😤`,
            body: `You dropped to #${newRank + 1} in ${teamName}. Time for a comeback quiz!`,
            data: { type: 'squad-update', screen: 'FamilyTab' },
            sound: false,
          },
          trigger: null,
        });
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Handle a tapped notification: returns the screen to navigate to,
 * or null. Call from the notification-response listener in App.js.
 */
export function screenForNotificationResponse(response) {
  try {
    const data = response?.notification?.request?.content?.data;
    if (data?.screen) return data.screen;
  } catch {}
  return null;
}
