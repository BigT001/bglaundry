import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const cleanEnvVar = (val: string | undefined): string | undefined => {
  if (!val) return undefined;
  return val.replace(/^["']|["']$/g, '').trim();
};

const firebaseConfig = {
  apiKey: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || "mock-api-key",
  authDomain: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "bglaundry.firebaseapp.com",
  projectId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "bglaundry",
  storageBucket: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "bglaundry.firebasestorage.app",
  messagingSenderId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "179247049497",
  appId: cleanEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || "1:179247049497:web:dea31eb4babe6c17517388"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
