import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBgw0O4B_NbCvGfxOzSgEtNNYYYLoxFpic",
  authDomain: "clgsm-90aa8.firebaseapp.com",
  databaseURL: "https://clgsm-90aa8-default-rtdb.firebaseio.com",
  projectId: "clgsm-90aa8",
  storageBucket: "clgsm-90aa8.firebasestorage.app",
  messagingSenderId: "599942427925",
  appId: "1:599942427925:web:b65c4ca2b4537c0fa7e51c",
  measurementId: "G-CXB0LNYWFH"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let messaging: Messaging | undefined;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { db, messaging, app };
