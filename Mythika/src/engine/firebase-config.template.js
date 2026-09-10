// Firebase configuration template for mythika-opencode project
// INSTRUCTIONS:
// 1. Copy this file to firebase-config.js
// 2. Replace all placeholder values with your actual Firebase project config
// 3. NEVER commit firebase-config.js (it's in .gitignore)

window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};

// Firestore collection path for game saves
const SAVE_COLLECTION = "game_saves";
