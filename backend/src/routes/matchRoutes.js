// backend/src/routes/matchRoutes.js
import { batchScoreJobs } from "../services/langchain/jobMatcher.js";

export default async function matchRoutes(fastify) {
  fastify.post("/match", async (request, reply) => {
    try {
      const { resumeText, jobs } = request.body;
      if (!resumeText || !jobs?.length) {
        return reply.status(400).send({ error: "resumeText and jobs are required", code: "INVALID_INPUT" });
      }
      const matches = await batchScoreJobs(resumeText, jobs);
      return { matches };
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "MATCH_ERROR" });
    }
  });
}
