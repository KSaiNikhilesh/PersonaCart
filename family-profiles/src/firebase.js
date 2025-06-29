import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
// Add these to your .env file (do NOT commit .env):
// REACT_APP_FIREBASE_API_KEY=...
// REACT_APP_FIREBASE_AUTH_DOMAIN=...
// REACT_APP_FIREBASE_PROJECT_ID=...
// REACT_APP_FIREBASE_STORAGE_BUCKET=...
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
// REACT_APP_FIREBASE_APP_ID=...
// REACT_APP_FIREBASE_MEASUREMENT_ID=...
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 
