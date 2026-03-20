// coverLetterRoutes.js - AI generates cover letter based on resume + job
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getFirestore, getAuth } from "../config/firebase.js";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.5,
  maxTokens: 600,
  apiKey: process.env.GROQ_API_KEY,
});

async function verifyToken(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { reply.status(401).send({ error: "Unauthorized" }); return null; }
  try {
    return await getAuth().verifyIdToken(authHeader.split(" ")[1]);
  } catch { reply.status(401).send({ error: "Invalid token" }); return null; }
}

export default async function coverLetterRoutes(fastify) {
  fastify.post("/cover-letter", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;

    try {
      const { jobTitle, company, jobDescription } = request.body;

      const db = getFirestore();
      const userDoc = await db.collection("users").doc(user.uid).get();
      const resumeText = userDoc.data()?.resumeText || "";

      if (!resumeText) {
        return { coverLetter: "Please upload your resume first to generate a personalized cover letter." };
      }

      const response = await model.invoke([
        new SystemMessage(`You are a professional cover letter writer. Write a concise, compelling cover letter (3 short paragraphs, under 200 words). Be specific, professional, and enthusiastic. Do NOT use placeholder text like [Your Name].`),
        new HumanMessage(`Write a cover letter for this job:
JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION: ${(jobDescription || "").slice(0, 400)}

CANDIDATE RESUME:
${resumeText.slice(0, 800)}

Write a professional cover letter starting with "Dear Hiring Manager,"`),
      ]);

      return { coverLetter: response.content.toString() };
    } catch (err) {
      fastify.log.error("Cover letter error: " + err.message);
      reply.status(500).send({ error: err.message });
    }
  });
}
