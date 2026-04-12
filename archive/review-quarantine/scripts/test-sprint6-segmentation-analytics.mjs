import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'civic-citizenship-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'civic-citizenship-app',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'civic-citizenship-app.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1089484361825',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1089484361825:web:f5c7edcd3f5d55ee0c5a20',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://civic-citizenship-app-default-rtdb.firebaseio.com/',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-CT4V0D1WZL',
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing FIREBASE_API_KEY/EXPO_PUBLIC_FIREBASE_API_KEY for segmentation analytics validation script.');
}

const DEBUG_COLLECTION = 'analytics_debug_events';
const app = initializeApp(firebaseConfig, 'segmentation-analytics-validation');
const db = getFirestore(app);

async function getEventCount(eventName) {
  const snapshot = await getCountFromServer(
    query(collection(db, DEBUG_COLLECTION), where('eventName', '==', eventName)),
  );
  return snapshot.data().count;
}

async function emitSyntheticEvents() {
  const createdAtIso = new Date().toISOString();
  const shared = {
    platform: 'validation-script',
    createdAt: serverTimestamp(),
    createdAtIso,
    debugBuild: true,
  };

  await addDoc(collection(db, DEBUG_COLLECTION), {
    ...shared,
    eventName: 'segment_transition',
    params: {
      season_id: 'season-validation-script',
      week_key: createdAtIso.slice(0, 10),
      entries: 4,
      changed_count: 2,
      unchanged_count: 2,
      transition_types: 2,
      top_transition: 'warming->high-intent',
      top_transition_count: 1,
      synthetic_validation: true,
      source: 'scripts/test-sprint6-segmentation-analytics.mjs',
    },
  });

  await addDoc(collection(db, DEBUG_COLLECTION), {
    ...shared,
    eventName: 'offer_cap_decision',
    params: {
      channel: 'interstitial',
      trigger: 'quizComplete',
      decision: 'blocked',
      reason: 'cooldown',
      segment: 'low-intent',
      cooldown_ms: 300000,
      daily_limit: 6,
      trigger_limit: 3,
      synthetic_validation: true,
      source: 'scripts/test-sprint6-segmentation-analytics.mjs',
    },
  });

  await addDoc(collection(db, DEBUG_COLLECTION), {
    ...shared,
    eventName: 'offer_cap_decision',
    params: {
      channel: 'rewarded_free_pack',
      trigger: 'daily_unlock',
      decision: 'allowed',
      reason: 'shown',
      segment: 'high-intent',
      cooldown_ms: 2700000,
      daily_limit: 2,
      trigger_limit: 0,
      synthetic_validation: true,
      source: 'scripts/test-sprint6-segmentation-analytics.mjs',
    },
  });
}

async function getLatestValidationRows() {
  const snapshot = await getDocs(
    query(
      collection(db, DEBUG_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(10),
    ),
  );

  return snapshot.docs
    .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
    .filter((row) => row?.params?.source === 'scripts/test-sprint6-segmentation-analytics.mjs')
    .slice(0, 3)
    .map((row) => ({
      eventName: row.eventName,
      createdAtIso: row.createdAtIso,
      params: row.params,
    }));
}

const beforeSegmentTransition = await getEventCount('segment_transition');
const beforeOfferCapDecision = await getEventCount('offer_cap_decision');

await emitSyntheticEvents();

const afterSegmentTransition = await getEventCount('segment_transition');
const afterOfferCapDecision = await getEventCount('offer_cap_decision');
const latestValidationRows = await getLatestValidationRows();

console.log(JSON.stringify({
  date: new Date().toISOString().slice(0, 10),
  before: {
    segment_transition: beforeSegmentTransition,
    offer_cap_decision: beforeOfferCapDecision,
  },
  after: {
    segment_transition: afterSegmentTransition,
    offer_cap_decision: afterOfferCapDecision,
  },
  delta: {
    segment_transition: afterSegmentTransition - beforeSegmentTransition,
    offer_cap_decision: afterOfferCapDecision - beforeOfferCapDecision,
  },
  latestValidationRows,
}, null, 2));
