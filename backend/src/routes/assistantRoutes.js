// backend/src/routes/assistantRoutes.js
import { runAssistant } from "../services/langgraph/graph.js";

export default async function assistantRoutes(fastify) {
  fastify.post("/assistant", async (request, reply) => {
    try {
      const { message, conversationHistory = [], currentFilters = {} } = request.body;

      if (!message?.trim()) {
        return reply.status(400).send({ error: "message is required" });
      }

      const result = await runAssistant({
        userMessage: message,
        conversationHistory,
        currentFilters,
      });

      // Log what we got back for debugging
      fastify.log.info(`Intent: ${result.intent} | Message: "${result.assistantMessage}" | UIAction: ${result.uiAction?.type}`);

      const responseMessage = result.assistantMessage ||
        (result.uiAction?.type === "UPDATE_FILTERS" ? "Done! Filters updated. 🎯" : "Got it!");

      return {
        message: responseMessage,
        uiAction: result.uiAction || { type: "NONE", payload: {} },
        intent: result.intent,
        jobResults: result.searchResults || [],
      };

    } catch (err) {
      fastify.log.error(`ASSISTANT ERROR: ${err.message}`);
      fastify.log.error(err.stack);
      return reply.status(500).send({
        error: err.message,
        code: "ASSISTANT_ERROR"
      });
    }
  });
}
