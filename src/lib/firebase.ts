// ABOUTME: Firebase app initialization and service exports.
// ABOUTME: Connects to emulators when VITE_USE_EMULATORS is set, otherwise uses production config.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

const demoConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'demo-learning-multiply',
  storageBucket: 'demo-learning-multiply.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:fake',
};

const firebaseConfig = useEmulators
  ? demoConfig
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

if (!useEmulators && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  throw new Error(
    'Missing Firebase environment variables. ' +
    'Copy .env.local.template to .env.local and fill in your values.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const isEmulatorMode = useEmulators;

if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
