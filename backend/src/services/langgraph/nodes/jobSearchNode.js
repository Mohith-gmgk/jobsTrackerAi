// jobSearchNode.js - LangGraph node + Groq via LangChain
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  maxTokens: 200,
  apiKey: process.env.GROQ_API_KEY,
});

export async function jobSearchNode(state) {
  try {
    const response = await model.invoke([
      new SystemMessage(`Extract job search params. Reply ONLY with JSON, no markdown.
Fields: role(string), skills(string[]), location(string), workMode("remote"|"hybrid"|"on-site"), datePosted("24h"|"week"|"month"|"any")
Example: "senior React developer remote" → {"role":"React developer","skills":["React"],"workMode":"remote"}`),
      new HumanMessage(state.userMessage),
    ]);
    const text = response.content.toString().trim().replace(/```json/g,"").replace(/```/g,"").trim();
    console.log("[Search]", text);
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    const params = jsonMatch ? JSON.parse(jsonMatch[0]) : { role: state.userMessage };
    return { uiAction: { type: "UPDATE_FILTERS", payload: params }, processingStep: "job_search_node" };
  } catch (err) {
    console.error("[Search] Error:", err.message);
    return { uiAction: { type: "NONE", payload: {} }, error: err.message };
  }
}
