import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let isFirebaseAdminInitialized = false;
let authInstance: any = null;

const clean = (val: string | undefined) => {
  if (!val) return undefined;
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned;
};

if (getApps().length === 0) {
  const projectId = clean(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKeyRaw = clean(process.env.FIREBASE_PRIVATE_KEY);
  const privateKey = privateKeyRaw ? privateKeyRaw.replace(/\\n/g, '\n') : undefined;

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseAdminInitialized = true;
      authInstance = getAuth();
      console.log('[Firebase Admin] Successfully initialized modular SDK.');
    } catch (error) {
      console.error('[Firebase Admin] Initialization failed:', error);
    }
  } else {
    console.log('[Firebase Admin] Credentials missing or incomplete. Running in mock verification bypass mode.');
  }
} else {
  isFirebaseAdminInitialized = true;
  authInstance = getAuth();
}

export { authInstance as firebaseAuth, isFirebaseAdminInitialized };
