// backend/src/config/firebase.js
// Firebase Admin — Auth + Firestore only (no Storage needed)
import admin from "firebase-admin";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  initialized = true;
  return admin;
}

export function getFirestore() {
  return admin.firestore();
}

export function getAuth() {
  return admin.auth();
}
// Note: getStorage() removed — not needed, resumes stored as text in Firestore
