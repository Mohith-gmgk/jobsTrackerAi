// scripts/setup-firebase.js
// Run ONCE to create the test user in Firebase Auth
// Usage: node scripts/setup-firebase.js
//
// Prerequisites: Fill in backend/.env first, then run from project root.

import "dotenv/config";
import { initFirebaseAdmin, getAuth, getFirestore } from "../backend/src/config/firebase.js";

initFirebaseAdmin();

const TEST_EMAIL = "test@gmail.com";
const TEST_PASSWORD = "test@123";

async function setupFirebase() {
  const auth = getAuth();
  const db = getFirestore();

  console.log("🔧 Setting up Firebase for AI Job Tracker...\n");

  // 1. Create test user
  try {
    const existing = await auth.getUserByEmail(TEST_EMAIL).catch(() => null);
    if (existing) {
      console.log(`✅ Test user already exists: ${TEST_EMAIL} (uid: ${existing.uid})`);
    } else {
      const user = await auth.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        displayName: "Test User",
        emailVerified: true,
      });
      console.log(`✅ Created test user: ${TEST_EMAIL} (uid: ${user.uid})`);

      // Create Firestore profile for test user
      await db.collection("users").doc(user.uid).set({
        email: TEST_EMAIL,
        displayName: "Test User",
        createdAt: new Date(),
      });
      console.log(`✅ Created Firestore profile for test user`);
    }
  } catch (err) {
    console.error("❌ Failed to create test user:", err.message);
  }

  // 2. Create Firestore composite index hint
  console.log("\n📋 Firestore indexes needed:");
  console.log("   Collection: applications");
  console.log("   Fields: userId (ASC) + createdAt (DESC)");
  console.log("   → Firebase will auto-prompt you to create this when you first query.");
  console.log("   → Or deploy firestore.indexes.json manually.\n");

  console.log("🎉 Firebase setup complete!");
  console.log(`\nLogin credentials:\n  Email: ${TEST_EMAIL}\n  Password: ${TEST_PASSWORD}`);
  process.exit(0);
}

setupFirebase().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
