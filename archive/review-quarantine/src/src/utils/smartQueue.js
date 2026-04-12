import { daysSince } from './appUtils';

export function computeDueDays(entry) {
  const attempts = entry?.attempts || 0;
  const accuracy = attempts ? Math.round(((entry?.correct || 0) / attempts) * 100) : 0;
  if (attempts <= 1) return 1;
  if (accuracy < 60) return 1;
  if (accuracy < 75) return 2;
  if (accuracy < 90) return 4;
  return 7;
}

export function buildSmartQueueQuestionIds(byQuestion, limit = 8) {
  const entries = Object.entries(byQuestion || {}).map(([id, value]) => ({ id: String(id), ...value }));
  return entries
    .map((entry) => {
      const attempts = entry.attempts || 0;
      const accuracy = attempts ? Math.round((entry.correct / attempts) * 100) : 0;
      const since = daysSince(entry.lastSeen);
      const dueDays = computeDueDays(entry);
      const dueBoost = since >= dueDays ? 30 : 0;
      const priority = (100 - accuracy) * 1.4 + Math.min(25, since) + dueBoost;
      return {
        id: String(entry.id),
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((item) => item.id);
}