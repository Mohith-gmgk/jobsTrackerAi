// backend/src/routes/applicationRoutes.js
import { getFirestore, getAuth } from "../config/firebase.js";

async function verifyToken(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.status(401).send({ error: "Unauthorized", code: "NO_TOKEN" });
    return null;
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    return decoded;
  } catch {
    reply.status(401).send({ error: "Invalid token", code: "INVALID_TOKEN" });
    return null;
  }
}

export default async function applicationRoutes(fastify) {

  // Get all applications for a user
  fastify.get("/applications", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;
    try {
      const db = getFirestore(); // called inside handler, not at module level
      const snapshot = await db.collection("applications")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .get();
      const applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return { applications };
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "APPLICATIONS_FETCH_ERROR" });
    }
  });

  // Create application
  fastify.post("/applications", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;
    try {
      const db = getFirestore();
      const { jobId, jobTitle, company, jobUrl, matchScore } = request.body;
      const admin = await import("firebase-admin");
      const now = admin.default.firestore.Timestamp.now();
      const application = {
        userId: user.uid,
        jobId,
        jobTitle,
        company,
        jobUrl,
        matchScore: matchScore || 0,
        status: "applied",
        appliedAt: now,
        timeline: [{ status: "applied", changedAt: now, note: "Application submitted" }],
        createdAt: now,
      };
      const docRef = await db.collection("applications").add(application);
      return { id: docRef.id, ...application };
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "APPLICATION_CREATE_ERROR" });
    }
  });

  // Update application status
  fastify.patch("/applications/:id", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;
    try {
      const db = getFirestore();
      const { id } = request.params;
      const { status, note } = request.body;
      const validStatuses = ["applied", "interview", "offer", "rejected"];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send({ error: "Invalid status", code: "INVALID_STATUS" });
      }
      const docRef = db.collection("applications").doc(id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== user.uid) {
        return reply.status(404).send({ error: "Application not found", code: "NOT_FOUND" });
      }
      const adminPkg = await import("firebase-admin");
      const now = adminPkg.default.firestore.Timestamp.now();
      const currentTimeline = doc.data().timeline || [];
      await docRef.update({
        status,
        timeline: [...currentTimeline, { status, changedAt: now, note: note || "" }],
        updatedAt: now,
      });
      return { success: true };
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "APPLICATION_UPDATE_ERROR" });
    }
  });

  // Delete application
  fastify.delete("/applications/:id", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;
    try {
      const db = getFirestore();
      const { id } = request.params;
      const docRef = db.collection("applications").doc(id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== user.uid) {
        return reply.status(404).send({ error: "Not found", code: "NOT_FOUND" });
      }
      await docRef.delete();
      return { success: true };
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "DELETE_ERROR" });
    }
  });
}
