import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const clean = (val: string | undefined): string | undefined =>
  val ? val.replace(/^["']|["']$/g, '').trim() : undefined;

const firebaseConfig = {
  apiKey:            clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)            || 'mock-api-key',
  authDomain:        clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)        || 'bglaundry.firebaseapp.com',
  projectId:         clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)         || 'bglaundry',
  storageBucket:     clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)     || 'bglaundry.firebasestorage.app',
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)|| '179247049497',
  appId:             clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)             || '1:179247049497:web:dea31eb4babe6c17517388',
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Disable App Check / reCAPTCHA Enterprise for localhost dev.
// This prevents the "Failed to initialize reCAPTCHA Enterprise config" warning
// that causes auth/invalid-app-credential on local development.
if (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.') ||
     window.location.hostname.startsWith('10.') ||
     window.location.hostname.startsWith('172.'))) {
  // @ts-ignore – internal flag, not in public typings
  auth.settings.appVerificationDisabledForTesting = true;
}

export { app, auth };
