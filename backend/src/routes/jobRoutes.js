// backend/src/routes/jobRoutes.js
import { fetchJobs } from "../services/adzunaService.js";

export default async function jobRoutes(fastify) {
  fastify.get("/jobs", async (request, reply) => {
    try {
      const { role, location, page = 1, results = 20 } = request.query;
      const data = await fetchJobs({ role, location, page: Number(page), results: Number(results) });
      return data;
    } catch (err) {
      reply.status(500).send({ error: err.message, code: "JOBS_FETCH_ERROR" });
    }
  });
}
