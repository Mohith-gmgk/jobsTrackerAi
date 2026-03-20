// server.js - Updated with bonus feature routes
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { initFirebaseAdmin } from "./config/firebase.js";
import { initLangGraph } from "./services/langgraph/graph.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import resumeTipsRoutes from "./routes/resumeTipsRoutes.js";
import coverLetterRoutes from "./routes/coverLetterRoutes.js";

// Initialize Firebase first
initFirebaseAdmin();

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
});

await server.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All routes
await server.register(jobRoutes, { prefix: "/api" });
await server.register(resumeRoutes, { prefix: "/api" });
await server.register(matchRoutes, { prefix: "/api" });
await server.register(assistantRoutes, { prefix: "/api" });
await server.register(applicationRoutes, { prefix: "/api" });
await server.register(resumeTipsRoutes, { prefix: "/api" });
await server.register(coverLetterRoutes, { prefix: "/api" });

server.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

server.addHook("onReady", async () => {
  await initLangGraph();
  server.log.info("LangGraph initialized ✓");
});

try {
  await server.listen({ port: Number(process.env.PORT) || 3001, host: "0.0.0.0" });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
