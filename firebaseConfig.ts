
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/analytics";

// Safe access to environment variables
const env = typeof process !== 'undefined' ? process.env : {};

// Your web app's Firebase configuration
// SECURITY NOTE: Values are loaded from .env to prevent API key leakage in public repositories.
const firebaseConfig = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
  measurementId: env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Robust check to see if we are in "Real" mode or "Mock" mode
export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.includes("your-project") && 
  !!firebaseConfig.projectId;

let app;
let auth: firebase.auth.Auth;
let db: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;
let googleProvider: firebase.auth.GoogleAuthProvider;
let analytics: firebase.analytics.Analytics;

if (isFirebaseConfigured) {
  try {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    
    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    
    if (typeof window !== 'undefined') {
        analytics = firebase.analytics();
    }
    
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
} else {
  console.log("⚠️ Firebase Config Incomplete: App running in Demo/Mock Mode. (Check .env file)");
}

export { auth, db, storage, googleProvider, analytics };
