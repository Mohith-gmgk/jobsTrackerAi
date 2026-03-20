// backend/src/services/langgraph/nodes/responseFormatter.js
// Final node: shapes the response sent back to frontend

export async function responseFormatterNode(state) {
  // If help node already set a message, preserve it
  if (state.assistantMessage && state.intent === "help") {
    return {
      processingStep: "response_formatter",
    };
  }

  // For filter/search actions, generate a confirmation message
  if (state.uiAction?.type === "UPDATE_FILTERS") {
    const payload = state.uiAction.payload;

    if (payload.clearAll) {
      return {
        assistantMessage: "Done! I've cleared all filters. Showing all available jobs now. 🔄",
        processingStep: "response_formatter",
      };
    }

    const parts = [];
    if (payload.role) parts.push(`role: **${payload.role}**`);
    if (payload.workMode) parts.push(`work mode: **${payload.workMode}**`);
    if (payload.location) parts.push(`location: **${payload.location}**`);
    if (payload.skills?.length) parts.push(`skills: **${payload.skills.join(", ")}**`);
    if (payload.datePosted) parts.push(`posted: **${payload.datePosted === "24h" ? "last 24 hours" : "last " + payload.datePosted}**`);
    if (payload.jobType) parts.push(`type: **${payload.jobType}**`);
    if (payload.matchScore === "high") parts.push("only **high match** jobs (>70%)");

    const message = parts.length > 0
      ? `Got it! I've updated the filters — showing jobs with ${parts.join(", ")}. 🎯`
      : "I've updated the job feed for you!";

    return {
      assistantMessage: message,
      processingStep: "response_formatter",
    };
  }

  // Fallback
  if (!state.assistantMessage) {
    return {
      assistantMessage: state.error
        ? "Something went wrong. Could you rephrase your question?"
        : "I've updated the job feed based on your request!",
      processingStep: "response_formatter",
    };
  }

  return { processingStep: "response_formatter" };
}
