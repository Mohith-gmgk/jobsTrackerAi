// firebase.js - Handles all FIREBASE_PRIVATE_KEY formats
import admin from "firebase-admin";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  // Handle private key — works for both local and Render deployment
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
  
  // If key has literal \n replace with real newlines
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  
  // Remove surrounding quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1).replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
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
