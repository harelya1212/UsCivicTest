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
    apiKey: "AIzaSyDemoKeyReplaceme123456789abcdef", // Replace with real key
    authDomain: "civics-coach-app.firebaseapp.com", // Replace with real domain
    projectId: "civics-coach-app", // Replace with real project ID
    storageBucket: "civics-coach-app.appspot.com", // Replace with real bucket
    messagingSenderId: "123456789012", // Replace with real ID
    appId: "1:123456789012:web:abc123def456ghi789", // Replace with real app ID
    databaseURL: "https://civics-coach-app.firebaseio.com" // Replace with real URL
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);

export default firebaseConfig;
