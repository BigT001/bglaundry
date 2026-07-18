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

console.log('[Firebase Init] Raw API Key length:', rawApiKey?.length, 'Cleaned API Key:', cleanedApiKey ? cleanedApiKey.substring(0, 6) + '...' : 'undefined');

// Your Firebase configuration keys loaded from dynamic Expo variables
const firebaseConfig = {
  apiKey: cleanedApiKey || "mock-api-key",
  authDomain: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) || "bglaundry-auth.firebaseapp.com",
  projectId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) || "bglaundry-auth",
  storageBucket: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) || "bglaundry-auth.appspot.com",
  messagingSenderId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "000000000000",
  appId: cleanEnvVar(process.env.EXPO_PUBLIC_FIREBASE_APP_ID) || "1:000000000000:web:000000000000"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

if (__DEV__) {
  // @ts-ignore – disable recaptcha/safety checks for local simulators with whitelisted numbers
  auth.settings.appVerificationDisabledForTesting = true;
}

export { app, auth };
