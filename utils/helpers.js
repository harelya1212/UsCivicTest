// Pure utility functions shared across screens

export const QUESTIONS_BY_TEST_TYPE = {
  highschool: 100,
  naturalization100: 100,
  naturalization128: 128,
};

export function getDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function daysSince(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  const now = new Date();
  const deltaMs = now.getTime() - date.getTime();
  return Math.floor(deltaMs / (1000 * 60 * 60 * 24));
}

export function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const parts = String(value).split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts.map((p) => Number(p));
    if (month && day && year) {
      const fallback = new Date(year, month - 1, day);
      if (!Number.isNaN(fallback.getTime())) return fallback;
    }
  }

  return null;
}

export function generateStudyPlan(testDetails) {
  const date = parseDateSafe(testDetails?.testDate);
  if (!date) return null;

  const now = new Date();
  const daysUntilTest = Math.max(1, Math.ceil((date - now) / (1000 * 60 * 60 * 24)));
  const totalQuestions = QUESTIONS_BY_TEST_TYPE[testDetails?.testType] || 128;
  const questionsPerDay = Math.max(5, Math.ceil(totalQuestions / daysUntilTest));
  const reviewEvery = daysUntilTest <= 14 ? 2 : 3;

  return {
    generatedAt: new Date().toISOString(),
    daysUntilTest,
    totalQuestions,
    questionsPerDay,
    reviewEvery,
    targetWeeklyQuestions: questionsPerDay * 7,
    focus: daysUntilTest <= 21 ? 'High intensity review mode' : 'Steady daily practice mode',
  };
}

export function calculateEstimatedRevenue(interstitialCount, rewardedCount, interstitialEcpm, rewardedEcpm) {
  return ((interstitialCount || 0) / 1000) * interstitialEcpm + ((rewardedCount || 0) / 1000) * rewardedEcpm;
}

export function buildSevenDayRevenueTrend(history, interstitialEcpm, rewardedEcpm) {
  const historyMap = new Map((history || []).map((entry) => [entry.dayKey, entry]));
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dayKey = date.toISOString().slice(0, 10);
    const entry = historyMap.get(dayKey) || {
      dayKey,
      interstitialShown: 0,
      rewardedCompleted: 0,
    };
    const revenue = calculateEstimatedRevenue(
      entry.interstitialShown,
      entry.rewardedCompleted,
      interstitialEcpm,
      rewardedEcpm
    );

    days.push({
      ...entry,
      revenue,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
    });
  }

  return days;
}

export function withAutoStudyPlan(nextDetails, previousDetails = {}) {
  const merged = {
    ...previousDetails,
    ...nextDetails,
  };

  if (!merged.state && merged.location) {
    merged.state = merged.location;
  }

  if (!merged.location && merged.state) {
    merged.location = merged.state;
  }

  merged.studyPlan = generateStudyPlan(merged);
  return merged;
}

export function buildCaseProgressStorageKey(testDetails) {
  const prefix = 'civics.caseProgress.v1';
  const raw = `${testDetails?.name || 'default'}_${testDetails?.state || testDetails?.location || 'unknown'}`;
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${prefix}.${normalized || 'default'}`;
}

export function buildCaseReminderStorageKey(testDetails) {
  const prefix = 'civics.caseReminder.v1';
  const raw = `${testDetails?.name || 'default'}_${testDetails?.state || testDetails?.location || 'unknown'}`;
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${prefix}.${normalized || 'default'}`;
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildDefaultCaseProgress(testDetails) {
  const today = new Date().toLocaleDateString();
  return {
    applicantName: testDetails?.name || 'Applicant',
    receiptNumber: '',
    caseType: 'N-400',
    currentStage: 0,
    latestStatus: 'Case created in app tracker',
    lastUpdated: today,
    notes: '',
    timeline: [],
  };
}

export function getQuestionTopic(question) {
  return question?.topic || question?.category || 'General';
}

export function getQuestionSubTopic(question) {
  return question?.subTopic || 'General';
}

export const weakAreaEstimator = (history) => {
  const counts = {};
  for (const record of history) {
    if (!counts[record.topic]) counts[record.topic] = { total: 0, wrong: 0 };
    counts[record.topic].total += 1;
    if (!record.correct) counts[record.topic].wrong += 1;
  }
  const weaknesses = Object.entries(counts)
    .map(([topic, { total, wrong }]) => ({ topic, wrong, total, ratio: wrong / total }))
    .sort((a, b) => b.ratio - a.ratio);
  return weaknesses.slice(0, 3);
};
