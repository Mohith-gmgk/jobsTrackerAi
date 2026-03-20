// resumeTipsRoutes.js - Better quality resume tips
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getFirestore, getAuth } from "../config/firebase.js";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.4,
  maxTokens: 400,
  apiKey: process.env.GROQ_API_KEY,
});

async function verifyToken(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { reply.status(401).send({ error: "Unauthorized" }); return null; }
  try { return await getAuth().verifyIdToken(authHeader.split(" ")[1]); }
  catch { reply.status(401).send({ error: "Invalid token" }); return null; }
}

export default async function resumeTipsRoutes(fastify) {
  fastify.post("/resume-tips", async (request, reply) => {
    const user = await verifyToken(request, reply);
    if (!user) return;

    try {
      const { jobTitle, jobDescription, jobSkills } = request.body;
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(user.uid).get();
      const resumeText = userDoc.data()?.resumeText || "";

      if (!resumeText) {
        return { tips: [
          "Upload your resume first to get personalized tips!",
          "Click the 📄 Resume button in the header to upload",
          "Supported formats: PDF or TXT (max 5MB)"
        ]};
      }

      const response = await model.invoke([
        new SystemMessage(`You are a professional career coach and resume expert. 
Analyze the candidate's resume against the job requirements and give exactly 3 SPECIFIC, ACTIONABLE resume improvement tips.

Each tip must be:
- Specific to THIS job and THIS resume (not generic advice)
- Actionable — tell them exactly what to add or change
- Concise — max 25 words each

Reply ONLY as a valid JSON array of 3 strings: ["tip1", "tip2", "tip3"]
Do NOT include markdown, code blocks, or any other text.`),
        new HumanMessage(`JOB TITLE: ${jobTitle}
REQUIRED SKILLS: ${(jobSkills||[]).join(", ") || "software development"}
JOB DESCRIPTION: ${(jobDescription||"").slice(0, 500)}

CANDIDATE RESUME:
${resumeText.slice(0, 1200)}

Give 3 specific tips to improve this resume for THIS job.`),
      ]);

      const text = response.content.toString().trim()
        .replace(/```json/g,"").replace(/```/g,"").trim();
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      const tips = jsonMatch ? JSON.parse(jsonMatch[0]) : [
        `Add ${(jobSkills||[]).slice(0,2).join(" and ")||"relevant"} to your skills section if you have experience`,
        "Quantify your achievements with specific metrics (e.g. 'Reduced load time by 40%')",
        "Add a tailored summary paragraph mentioning this specific role"
      ];

      return { tips: tips.slice(0, 3) };
    } catch (err) {
      fastify.log.error("Resume tips error: " + err.message);
      reply.status(500).send({ error: err.message });
    }
  });
}
