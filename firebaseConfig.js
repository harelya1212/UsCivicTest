// Firebase configuration (FREE TIER - $0 cost)
// This uses Firestore + Realtime Database on free tier
// No credit card required for free tier (12 months + always-free tier)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// IMPORTANT: Replace with your actual Firebase project credentials
// Get from: https://console.firebase.google.com
const firebaseConfig = {
    apiKey: "REVOKED_USE_EXPO_PUBLIC_FIREBASE_API_KEY",
    authDomain: "civic-citizenship-app.firebaseapp.com",
    projectId: "civic-citizenship-app",
    storageBucket: "civic-citizenship-app.firebasestorage.app",
    messagingSenderId: "1089484361825",
    appId: "1:1089484361825:web:f5c7edcd3f5d55ee0c5a20",
    databaseURL: "https://civic-citizenship-app-default-rtdb.firebaseio.com/",
    measurementId: "G-CT4V0D1WZL"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);

export default firebaseConfig;
