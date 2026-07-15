import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let isFirebaseAdminInitialized = false;
let authInstance: any = null;

if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      isFirebaseAdminInitialized = true;
      authInstance = getAuth();
      console.log('[Firebase Admin] Successfully initialized modular SDK.');
    } catch (error) {
      console.error('[Firebase Admin] Initialization failed:', error);
    }
  } else {
    console.log('[Firebase Admin] Credentials missing. Running in mock verification bypass mode.');
  }
} else {
  isFirebaseAdminInitialized = true;
  authInstance = getAuth();
}

export { authInstance as firebaseAuth, isFirebaseAdminInitialized };
