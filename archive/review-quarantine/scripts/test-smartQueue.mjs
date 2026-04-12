/**
 * Regression tests for utils/smartQueue.js
 * Run with: node scripts/test-smartQueue.mjs
 */

import { computeDueDays, buildSmartQueue } from '../utils/smartQueue.js';

let passed = 0;
let failed = 0;

function assert(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL [${label}]`);
    console.error(`       expected: ${JSON.stringify(expected)}`);
    console.error(`       got:      ${JSON.stringify(actual)}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

const TODAY = new Date().toISOString();

// ─── computeDueDays ───────────────────────────────────────────────────────────

console.log('\ncomputeDueDays:');

assert(computeDueDays({}), 1, 'no attempts → 1');
assert(computeDueDays({ attempts: 0, correct: 0 }), 1, '0 attempts → 1');
assert(computeDueDays({ attempts: 1, correct: 0 }), 1, '1 attempt (0% acc) → 1');
assert(computeDueDays({ attempts: 1, correct: 1 }), 1, '1 attempt (100% acc) → 1 (single attempt always 1)');
assert(computeDueDays({ attempts: 10, correct: 5 }), 1, '50% accuracy → 1');
// boundary: 60%
assert(computeDueDays({ attempts: 10, correct: 6 }), 2, '60% accuracy → 2');
assert(computeDueDays({ attempts: 10, correct: 7 }), 2, '70% accuracy → 2');
// boundary: 75%
assert(computeDueDays({ attempts: 4, correct: 3 }), 4, '75% accuracy → 4');
assert(computeDueDays({ attempts: 10, correct: 8 }), 4, '80% accuracy → 4');
// boundary: 90%
assert(computeDueDays({ attempts: 10, correct: 9 }), 7, '90% accuracy → 7');
assert(computeDueDays({ attempts: 10, correct: 10 }), 7, '100% accuracy → 7');
// null / undefined safety
assert(computeDueDays(null), 1, 'null entry → 1');
assert(computeDueDays(undefined), 1, 'undefined entry → 1');

// ─── buildSmartQueue ──────────────────────────────────────────────────────────

console.log('\nbuildSmartQueue:');

// empty/trivial inputs
assert(buildSmartQueue([]), [], 'empty entries → []');
assert(buildSmartQueue([], { limit: 5 }), [], 'empty entries with limit → []');

// fewer entries than limit
const two = [{ id: '1' }, { id: '2' }];
assert(buildSmartQueue(two, { limit: 8 }).length, 2, 'fewer entries than limit returns all entries');

// default limit is 8
const twenty = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
assert(buildSmartQueue(twenty).length, 8, 'default limit is 8');

// custom limit respected
assert(buildSmartQueue(twenty, { limit: 3 }).length, 3, 'custom limit=3 respected');
assert(buildSmartQueue(twenty, { limit: 15 }).length, 15, 'custom limit=15 respected');

// IDs are coerced to strings
const numId = [{ id: 42, attempts: 1, correct: 0 }];
assert(buildSmartQueue(numId)[0], '42', 'numeric ID coerced to string');

// weak question sorted before strong question (seen today, so no overdue boost)
const weakVsStrong = [
  { id: 'strong', attempts: 10, correct: 9, lastSeen: TODAY }, // 90% acc, today → priority = 10*1.4 + 0 + 0 = 14
  { id: 'weak',   attempts: 10, correct: 2, lastSeen: TODAY }, // 20% acc, today → dueBoost=30 (since 0>=1? no → 0). priority = 80*1.4+0+0=112? 
  // weak: accuracy=20, dueDays=1, since=0, dueBoost = (0>=1)? 30:0 = 0 → priority = (100-20)*1.4 + 0 + 0 = 112
  // strong: accuracy=90, dueDays=7, since=0, dueBoost=0 → priority = 10*1.4 + 0 + 0 = 14
];
const weakFirst = buildSmartQueue(weakVsStrong, { limit: 2 });
assert(weakFirst[0], 'weak',   'weak (20% acc) sorted before strong (90% acc)');
assert(weakFirst[1], 'strong', 'strong (90% acc) sorted after weak');

// overdue boost lifts a mediocre question above a weak-but-fresh one
// overdue: 60% accuracy, 3 days ago → dueDays=2, since=3, overdue → priority = 40*1.4 + 3 + 30 = 56+3+30 = 89
// fresh:   20% accuracy, today     → dueDays=1, since=0, not overdue → priority = 80*1.4 + 0 + 0 = 112
// fresh (112) > overdue (89), so fresh should come first in this case
const freshVsOverdue = [
  { id: 'overdue',  attempts: 10, correct: 6, lastSeen: daysAgo(3) }, // 60%, 3 days ago → see above
  { id: 'fresh20',  attempts: 10, correct: 2, lastSeen: TODAY },       // 20%, today
];
const freshFirst = buildSmartQueue(freshVsOverdue, { limit: 2 });
assert(freshFirst[0], 'fresh20', 'very weak fresh (20%) outscores overdue mediocre (60%)');

// overdue boost matters when accuracies are similar
// overdue: 80% acc, 5 days ago → dueDays=4, since=5, overdue → priority = 20*1.4 + 5 + 30 = 28+5+30 = 63
// current: 80% acc, today     → dueDays=4, since=0, not due  → priority = 20*1.4 + 0 + 0  = 28
const overdueBeats = [
  { id: 'current', attempts: 10, correct: 8, lastSeen: TODAY },       // 80%, today → 28
  { id: 'overdue', attempts: 10, correct: 8, lastSeen: daysAgo(5) },  // 80%, 5 days ago → 63
];
const overdueFirst = buildSmartQueue(overdueBeats, { limit: 2 });
assert(overdueFirst[0], 'overdue',  'overdue same-accuracy question ranks above fresh same-accuracy');
assert(overdueFirst[1], 'current',  'fresh same-accuracy question ranks second');

// unseen questions (no lastSeen) get max days boost → come before seen-today 0% question
// unseen:    attempts=0,  acc=0,  since=Infinity → min(25,Inf)=25 + dueBoost=30 → priority = 140+25+30 = 195
// seen-zero: attempts=10, acc=0%, since=0        → dueBoost=0 (0>=1 is false)   → priority = 140+0+0  = 140
const unseenVsSeen = [
  { id: 'seen-zero', attempts: 10, correct: 0, lastSeen: TODAY },
  { id: 'unseen',    attempts: 0,  lastSeen: null },
];
const unseenFirst = buildSmartQueue(unseenVsSeen, { limit: 2 });
assert(unseenFirst[0], 'unseen',    'unseen question (null lastSeen) ranks above seen-today 0% question');
assert(unseenFirst[1], 'seen-zero', 'seen-today 0% question ranks second');

// no duplicates in result
const dupCheck = buildSmartQueue(twenty, { limit: 20 }).length;
const unique = new Set(buildSmartQueue(twenty, { limit: 20 })).size;
assert(dupCheck, unique, 'no duplicate IDs in result');

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\nSmart Queue tests: ${passed} passed${failed ? `, ${failed} FAILED` : ''}`);
if (failed > 0) process.exit(1);
