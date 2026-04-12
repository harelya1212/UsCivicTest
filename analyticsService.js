import { Platform } from 'react-native';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import firebaseConfig, { firebaseApp, db } from './firebaseConfig';

const DEBUG_COLLECTION = 'analytics_debug_events';

let analyticsInstancePromise = null;

const sanitizeParams = (params = {}) => Object.entries(params).reduce((acc, [key, value]) => {
  if (value == null) return acc;
  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    acc[key] = value;
  } else if (Array.isArray(value)) {
    acc[key] = JSON.stringify(value);
  } else if (valueType === 'object') {
    acc[key] = JSON.stringify(value);
  }
  return acc;
}, {});

const getAnalyticsInstance = async () => {
  if (Platform.OS !== 'web' || !firebaseConfig?.measurementId) {
    return null;
  }

  if (!analyticsInstancePromise) {
    analyticsInstancePromise = (async () => {
      try {
        const analyticsModule = await import('firebase/analytics');
        const supported = await analyticsModule.isSupported();
        if (!supported) return null;
        return analyticsModule.getAnalytics(firebaseApp);
      } catch (error) {
        console.log('[Analytics] Firebase web analytics unavailable:', error?.message || error);
        return null;
      }
    })();
  }

  return analyticsInstancePromise;
};

const mirrorDebugEvent = async (eventName, params) => {
  try {
    await addDoc(collection(db, DEBUG_COLLECTION), {
      eventName,
      params,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      debugBuild: __DEV__,
    });
  } catch (error) {
    console.log('[Analytics] Firestore debug mirror failed:', error?.message || error);
  }
};

export const logAppAnalyticsEvent = async (eventName, params = {}) => {
  if (!eventName) return { sink: 'none' };

  const safeParams = sanitizeParams(params);
  let sink = 'console';

  try {
    const analytics = await getAnalyticsInstance();
    if (analytics) {
      const analyticsModule = await import('firebase/analytics');
      await analyticsModule.logEvent(analytics, eventName, {
        ...safeParams,
        debug_mode: __DEV__,
      });
      sink = 'firebase-analytics';
    }
  } catch (error) {
    console.log('[Analytics] Firebase logEvent failed:', error?.message || error);
  }

  if (__DEV__ || sink !== 'firebase-analytics') {
    await mirrorDebugEvent(eventName, safeParams);
    if (sink !== 'firebase-analytics') {
      sink = 'firestore-debug-mirror';
    }
  }

  return { sink, eventName, params: safeParams };
};

export const getAnalyticsVerificationMode = () => ({
  usesFirebaseAnalytics: Platform.OS === 'web' && Boolean(firebaseConfig?.measurementId),
  usesFirestoreDebugMirror: true,
  debugCollection: DEBUG_COLLECTION,
  measurementIdConfigured: Boolean(firebaseConfig?.measurementId),
});

export const fetchRecentAnalyticsDebugEvents = async (maxResults = 10) => {
  const snapshot = await getDocs(
    query(
      collection(db, DEBUG_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(Math.max(1, Math.min(200, maxResults)))
    )
  );

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
};