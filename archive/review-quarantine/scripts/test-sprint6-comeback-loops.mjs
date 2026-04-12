const COMEBACK_WINDOW_OFFSETS = Object.freeze({ d2: 2, d5: 5, d10: 10 });

function getDayKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function createDefaultComebackCampaign() {
  return {
    lastActiveDayKey: '',
    eligibleWindow: null,
    windows: {
      d2: {
        dayOffset: 2,
        eligible: false,
        lastEligibleDayKey: null,
        lastTriggeredAt: null,
        shownCount: 0,
        claimedCount: 0,
        lastClaimedAt: null,
      },
      d5: {
        dayOffset: 5,
        eligible: false,
        lastEligibleDayKey: null,
        lastTriggeredAt: null,
        shownCount: 0,
        claimedCount: 0,
        lastClaimedAt: null,
      },
      d10: {
        dayOffset: 10,
        eligible: false,
        lastEligibleDayKey: null,
        lastTriggeredAt: null,
        shownCount: 0,
        claimedCount: 0,
        lastClaimedAt: null,
      },
    },
  };
}

function normalizeComebackCampaign(raw = {}) {
  const defaults = createDefaultComebackCampaign();
  const windows = raw?.windows && typeof raw.windows === 'object' ? raw.windows : {};

  return {
    ...defaults,
    ...(raw || {}),
    windows: {
      d2: {
        ...defaults.windows.d2,
        ...(windows.d2 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d2,
      },
      d5: {
        ...defaults.windows.d5,
        ...(windows.d5 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d5,
      },
      d10: {
        ...defaults.windows.d10,
        ...(windows.d10 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d10,
      },
    },
  };
}

function getDayKeyDistance(previousDayKey, currentDayKey) {
  if (!previousDayKey || !currentDayKey) return 0;
  const previousMs = Date.parse(`${previousDayKey}T00:00:00.000Z`);
  const currentMs = Date.parse(`${currentDayKey}T00:00:00.000Z`);
  if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return 0;
  return Math.max(0, Math.round((currentMs - previousMs) / (24 * 60 * 60 * 1000)));
}

function deriveComebackCampaign(runtime = {}, nowMs = Date.now()) {
  const currentDayKey = getDayKey(new Date(nowMs));
  const campaign = normalizeComebackCampaign(runtime?.comebackCampaign || {});
  const lastActiveDayKey = String(campaign?.lastActiveDayKey || runtime?.dayKey || '').trim();
  const inactiveDays = getDayKeyDistance(lastActiveDayKey, currentDayKey);
  const nextWindows = Object.entries(campaign.windows).reduce((acc, [windowKey, windowValue]) => {
    acc[windowKey] = {
      ...windowValue,
      eligible: false,
    };
    return acc;
  }, {});

  let eligibleWindow = null;
  let triggeredWindow = null;

  if (lastActiveDayKey && inactiveDays > 0) {
    Object.entries(COMEBACK_WINDOW_OFFSETS).forEach(([windowKey, dayOffset]) => {
      if (inactiveDays === dayOffset) {
        const previousWindow = nextWindows[windowKey];
        const firstTriggerForToday = previousWindow.lastEligibleDayKey !== currentDayKey;
        nextWindows[windowKey] = {
          ...previousWindow,
          eligible: true,
          lastEligibleDayKey: currentDayKey,
          lastTriggeredAt: firstTriggerForToday ? new Date(nowMs).toISOString() : previousWindow.lastTriggeredAt,
          shownCount: firstTriggerForToday ? Number(previousWindow.shownCount || 0) + 1 : Number(previousWindow.shownCount || 0),
        };
        eligibleWindow = windowKey;
        if (firstTriggerForToday) triggeredWindow = windowKey;
      }
    });
  }

  return {
    campaign: {
      ...campaign,
      lastActiveDayKey: currentDayKey,
      eligibleWindow,
      windows: nextWindows,
    },
    triggeredWindow,
    inactiveDays,
    currentDayKey,
  };
}

function dayKeyDaysAgo(baseMs, daysAgo) {
  return getDayKey(new Date(baseMs - (daysAgo * 24 * 60 * 60 * 1000)));
}

const nowMs = Date.now();
const scenarios = [2, 5, 10].map((daysAgo) => {
  const runtime = {
    dayKey: dayKeyDaysAgo(nowMs, daysAgo),
    comebackCampaign: {
      ...createDefaultComebackCampaign(),
      lastActiveDayKey: dayKeyDaysAgo(nowMs, daysAgo),
    },
  };
  const result = deriveComebackCampaign(runtime, nowMs);
  const expectedWindow = `d${daysAgo}`;
  return {
    daysAgo,
    expectedWindow,
    eligibleWindow: result.campaign.eligibleWindow,
    triggeredWindow: result.triggeredWindow,
    shownCount: result.campaign.windows?.[expectedWindow]?.shownCount || 0,
    pass: result.campaign.eligibleWindow === expectedWindow && result.triggeredWindow === expectedWindow,
  };
});

const triggerCounts = scenarios.reduce((acc, scenario) => {
  acc[`D${scenario.daysAgo}`] = scenario.pass ? 1 : 0;
  return acc;
}, {});

const triggerAccuracy = scenarios.every((scenario) => scenario.pass) ? 'pass' : 'fail';

console.log(JSON.stringify({
  date: new Date(nowMs).toISOString().slice(0, 10),
  D2: triggerCounts.D2,
  D5: triggerCounts.D5,
  D10: triggerCounts.D10,
  triggerAccuracy,
  scenarios,
}, null, 2));
