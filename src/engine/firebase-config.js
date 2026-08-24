// Firebase configuration for mythika-opencode project
// ⚠️ DO NOT COMMIT REAL VALUES — this file is gitignored
// Copy firebase-config.template.js to this file and fill in your values

// Check if config is already set (e.g., via template copy at build time)
if (typeof window.FIREBASE_CONFIG === 'undefined') {
  window.FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "G-XXXXXXXXXX"
  };
  console.warn('[Mythika] Using placeholder Firebase config — copy firebase-config.template.js and add real values');
}

// Firestore collection path for game saves
const SAVE_COLLECTION = "game_saves";
