// backend/src/routes/resumeRoutes.js
// NO Firebase Storage needed — resume text saved directly to Firestore (free plan safe)

import { getAuth, getFirestore } from "../config/firebase.js";
import pdf from "pdf-parse/lib/pdf-parse.js";

async function verifyToken(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.status(401).send({ error: "Unauthorized", code: "NO_TOKEN" });
    return null;
  }
  try {
    const token = authHeader.split(" ")[1];
    return await getAuth().verifyIdToken(token);
  } catch {
    reply.status(401).send({ error: "Invalid token", code: "INVALID_TOKEN" });
    return null;
  }
}

export default async function resumeRoutes(fastify) {

  // POST /api/resume — upload + parse resume, save text to Firestore
  fastify.post("/resume", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;

    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: "No file uploaded", code: "NO_FILE" });

      const buffer = await data.toBuffer();
      const mimeType = data.mimetype;
      const fileName = data.filename || "resume";

      if (!["application/pdf", "text/plain"].includes(mimeType)) {
        return reply.status(400).send({ error: "Only PDF or TXT files allowed", code: "INVALID_FILE_TYPE" });
      }

      // Extract text from PDF or TXT
      let resumeText = "";
      if (mimeType === "application/pdf") {
        const parsed = await pdf(buffer);
        resumeText = parsed.text || "";
      } else {
        resumeText = buffer.toString("utf-8");
      }

      if (!resumeText.trim()) {
        return reply.status(400).send({ error: "Could not extract text from file. Try a text-based PDF.", code: "EMPTY_TEXT" });
      }

      // Save to Firestore (no Storage needed)
      const db = getFirestore();
      await db.collection("users").doc(user.uid).set({
        resumeFileName: fileName,
        resumeText: resumeText.slice(0, 15000), // Firestore doc limit is 1MB, 15k chars is plenty
        resumeUpdatedAt: new Date(),
        hasResume: true,
      }, { merge: true });

      return {
        success: true,
        hasResume: true,
        fileName,
        textLength: resumeText.length,
      };

    } catch (err) {
      reply.status(500).send({ error: err.message, code: "RESUME_UPLOAD_ERROR" });
    }
  });

  // GET /api/resume — return resume info + text for matching
  fastify.get("/resume", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;

    try {
      const db = getFirestore();
      const doc = await db.collection("users").doc(user.uid).get();

      if (!doc.exists || !doc.data()?.hasResume) {
        return { hasResume: false };
      }

      const data = doc.data();
      return {
        hasResume: true,
        resumeFileName: data.resumeFileName || "resume.pdf",
        resumeText: data.resumeText || "",
        resumeUpdatedAt: data.resumeUpdatedAt,
        textLength: data.resumeText?.length || 0,
      };

    } catch (err) {
      reply.status(500).send({ error: err.message, code: "RESUME_FETCH_ERROR" });
    }
  });
}
