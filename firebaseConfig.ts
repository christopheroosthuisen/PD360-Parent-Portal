
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB5kNhvErVsIhtGw5zshNRTAjU4cvVALJI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0008467147.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "gen-lang-client-0008467147",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0008467147.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "516214084332",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:516214084332:web:2009d5678bad093ffc8bc9",
  measurementId: "G-VZCDQQPFR0"
};

// Check if configuration is valid
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

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
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    if (typeof window !== 'undefined') {
        analytics = firebase.analytics();
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("⚠️ Firebase Config Missing: Backend features will be disabled.");
}

export { auth, db, storage, googleProvider, analytics };
