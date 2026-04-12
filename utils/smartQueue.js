import { daysSince } from './helpers.js';

/**
 * Returns a due-in-days threshold for spaced repetition based on entry accuracy.
 * @param {{ attempts?: number, correct?: number }} entry
 * @returns {number}
 */
export function computeDueDays(entry) {
  const attempts = entry?.attempts || 0;
  const accuracy = attempts ? Math.round(((entry?.correct || 0) / attempts) * 100) : 0;
  if (attempts <= 1) return 1;
  if (accuracy < 60) return 1;
  if (accuracy < 75) return 2;
  if (accuracy < 90) return 4;
  return 7;
}

/**
 * Builds an ordered list of at most `limit` question IDs prioritised by
 * weakness + overdue status.
 *
 * @param {Array<{ id: string|number, attempts?: number, correct?: number, lastSeen?: string }>} entries
 * @param {{ limit?: number }} options
 * @returns {string[]}
 */
export function buildSmartQueue(entries, { limit = 8 } = {}) {
  const withPriority = entries.map((entry) => {
    const attempts = entry.attempts || 0;
    const accuracy = attempts ? Math.round((entry.correct / attempts) * 100) : 0;
    const since = daysSince(entry.lastSeen);
    const dueDays = computeDueDays(entry);
    const dueBoost = since >= dueDays ? 30 : 0;
    const priority = (100 - accuracy) * 1.4 + Math.min(25, since) + dueBoost;
    return { id: String(entry.id), priority };
  });

  return withPriority
    .sort((a, b) => b.priority - a.priority)
    .map((item) => item.id)
    .slice(0, limit);
}
