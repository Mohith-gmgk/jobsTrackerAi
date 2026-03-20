// jobMatcher.js - Score all 20 jobs sequentially
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.1,
  maxTokens: 150,
  apiKey: process.env.GROQ_API_KEY,
});

async function scoreOneJob(resumeText, job) {
  try {
    const response = await model.invoke([
      new SystemMessage(`Score resume vs job 0-100. Reply ONLY with JSON: {"score":72,"matchingSkills":["React"],"relevantExperience":"2 yrs frontend","keywordsAlignment":"JS overlap"}`),
      new HumanMessage(`RESUME: ${resumeText.slice(0, 800)}\nJOB: ${job.title}\nSKILLS: ${(job.skills||[]).join(",")||"software"}\nDESC: ${job.description.slice(0,200)}`),
    ]);

    const text = response.content.toString().trim()
      .replace(/```json/g,"").replace(/```/g,"").trim();
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    const score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
    console.log(`[Match] "${job.title?.slice(0,25)}": ${score}%`);
    return {
      jobId: job.id,
      score,
      explanation: {
        matchingSkills: parsed.matchingSkills || [],
        relevantExperience: parsed.relevantExperience || "",
        keywordsAlignment: parsed.keywordsAlignment || "",
      },
    };
  } catch (err) {
    console.error(`[Match] Error "${job.title?.slice(0,20)}":`, err.message);
    return { jobId: job.id, score: 0, explanation: { matchingSkills: [], relevantExperience: "", keywordsAlignment: "" } };
  }
}

export async function batchScoreJobs(resumeText, jobs) {
  console.log(`[Match] Scoring all ${jobs.length} jobs sequentially...`);
  const results = [];

  for (const job of jobs) {
    const result = await scoreOneJob(resumeText, job);
    results.push(result);
    await new Promise(r => setTimeout(r, 500)); // 500ms between each to avoid rate limit
  }

  console.log(`[Match] All done! Scores: ${results.slice(0,5).map(r=>r.score).join("%, ")}%`);
  return results;
}
