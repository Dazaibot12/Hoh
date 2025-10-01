/**
 * @fileoverview Firebase Admin SDK initialization and service getters.
 * This file is server-only and should not be imported into client components.
 * It uses a Base64 encoded service account key for robust initialization
 * in various deployment environments.
 * 
 * To generate the Base64 key:
 * node -e "console.log(Buffer.from(require('fs').readFileSync('serviceAccount.json','utf8')).toString('base64'))"
 * 
 * Then, set the output as the FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable.
 */
import 'server-only';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Normalizes the private key string by replacing escaped newlines
 * and removing potential surrounding quotes.
 * @param raw - The raw private key string from the parsed JSON.
 * @returns A PEM-compliant private key string.
 */
function normalizePrivateKey(raw?: string): string {
  if (!raw) {
    throw new Error('The "private_key" field is missing in the service account JSON.');
  }
  return raw.replace(/\\n/g, '\n').trim();
}

/**
 * Parses the service account JSON from a Base64 encoded environment variable.
 * @param b64 - The Base64 encoded service account JSON string.
 * @returns A parsed service account object with a normalized private key.
 */
function parseServiceAccountFromBase64(b64?: string): {
  project_id: string;
  client_email: string;
  private_key: string;
} {
  if (!b64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable is not set.');
  }
  
  const jsonString = Buffer.from(b64, 'base64').toString('utf8');
  const sa = JSON.parse(jsonString);

  return {
    project_id: sa.project_id,
    client_email: sa.client_email,
    private_key: normalizePrivateKey(sa.private_key),
  };
}


// Singleton flag to ensure initialization only runs once.
let firebaseAdminApp: App | undefined;

/**
 * Ensures that the Firebase Admin SDK is initialized. This function is idempotent.
 * It should only be called from server-side code.
 */
function ensureFirebaseAdminInitialized(): App {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (getApps().length > 0) {
    firebaseAdminApp = getApps()[0];
    if (!firebaseAdminApp) {
        // This case should ideally not be hit if getApps() returns a non-empty array.
        throw new Error('getApps() returned an array but the first element is undefined.');
    }
    return firebaseAdminApp;
  }

  try {
    const serviceAccount = parseServiceAccountFromBase64(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64);

    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
    });
    
    return firebaseAdminApp;

  } catch (error: any) {
    throw new Error(`Firebase admin initialization failed: ${error.message || String(error)}`);
  }
}

/**
 * A safe getter for the Firebase Admin Auth service.
 * It ensures the app is initialized before returning the service.
 * @returns The Firebase Admin Auth instance.
 */
export function adminAuth(): Auth {
  const app = ensureFirebaseAdminInitialized();
  return getAuth(app);
}

/**
 * A safe getter for the Firebase Admin Firestore service.
 * It ensures the app is initialized before returning the service.
 * @returns The Firebase Admin Firestore instance.
 */
export function adminDb(): Firestore {
  const app = ensureFirebaseAdminInitialized();
  return getFirestore(app);
}
