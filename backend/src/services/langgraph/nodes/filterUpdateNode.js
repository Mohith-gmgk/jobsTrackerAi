// filterUpdateNode.js - LangGraph node + Groq via LangChain
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  maxTokens: 200,
  apiKey: process.env.GROQ_API_KEY,
});

export async function filterUpdateNode(state) {
  if (state.intent === "clear_filters") {
    return { filterActions: { clearAll: true }, uiAction: { type: "UPDATE_FILTERS", payload: { clearAll: true } }, processingStep: "filter_update_node" };
  }
  try {
    const response = await model.invoke([
      new SystemMessage(`Extract filter values from user message. Reply ONLY with JSON, no markdown.
Fields: role(string), skills(string[]), datePosted("24h"|"week"|"month"|"any"), jobType("full-time"|"part-time"|"contract"|"internship"), workMode("remote"|"hybrid"|"on-site"), location(string), matchScore("high"|"medium"|"all")
Only include explicitly mentioned fields.
Example: "remote React jobs" → {"workMode":"remote","skills":["React"]}`),
      new HumanMessage(state.userMessage),
    ]);
    const text = response.content.toString().trim().replace(/```json/g,"").replace(/```/g,"").trim();
    console.log("[Filter]", text);
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    const filterActions = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return { filterActions, uiAction: { type: "UPDATE_FILTERS", payload: filterActions }, processingStep: "filter_update_node" };
  } catch (err) {
    console.error("[Filter] Error:", err.message);
    return { filterActions: null, uiAction: { type: "NONE", payload: {} }, error: err.message };
  }
}
