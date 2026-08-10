import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to strip quotes if added by the parser
const cleanEnvVar = (val: string | undefined): string | undefined => {
  if (!val) return undefined;
  return val.replace(/^["']|["']$/g, '').trim();
};

const rawApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const cleanedApiKey = cleanEnvVar(rawApiKey);

const firebaseConfig = {
  apiKey: cleanedApiKey || 'AIzaSyAMs8YIAHnmkWO8__3IWWImrR-uSVz3WYM',
  authDomain: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'bglaundry.firebaseapp.com',
  projectId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) || 'bglaundry',
  storageBucket: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'bglaundry.firebasestorage.app',
  messagingSenderId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '179247049497',
  appId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_APP_ID) || '1:179247049497:android:c44f22b7a4a99b65517388',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Fast Refresh may initialize Auth before this module is evaluated again.
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export { app, auth };
