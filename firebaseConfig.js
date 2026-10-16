// Firebase configuration (FREE TIER - $0 cost)
// This uses Firestore + Realtime Database on free tier
// No credit card required for free tier (12 months + always-free tier)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// IMPORTANT: Set values through environment variables.
// For Expo runtime, define EXPO_PUBLIC_FIREBASE_* entries in your local .env.
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'civic-citizenship-app.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'civic-citizenship-app',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'civic-citizenship-app.firebasestorage.app',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1089484361825',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1089484361825:web:f5c7edcd3f5d55ee0c5a20',
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://civic-citizenship-app-default-rtdb.firebaseio.com/',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-CT4V0D1WZL'
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

if (!isFirebaseConfigured) {
    console.warn('Firebase apiKey missing. Set EXPO_PUBLIC_FIREBASE_API_KEY in your local environment. Firebase features (auth, sync) are disabled; the quiz works offline.');
}

// Initialize Firebase only when an API key is present. Without it the app
// runs in offline mode: firebaseApp/auth/db/realtimeDb are null and the
// service layer (which try/catches all Firebase calls) degrades gracefully.
export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize services
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const realtimeDb = firebaseApp ? getDatabase(firebaseApp) : null;

export default firebaseConfig;
