// helpNode.js - LangGraph node + Groq via LangChain
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
  maxTokens: 300,
  apiKey: process.env.GROQ_API_KEY,
});

export async function helpNode(state) {
  try {
    const history = state.conversationHistory.slice(-6).map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new SystemMessage(m.content)
    );
    const response = await model.invoke([
      new SystemMessage(`You are JobAI assistant for a job tracking app. Be friendly and helpful, under 80 words.
Features: Job Feed (Adzuna jobs), AI Matching (resume → 0-100% score per job, green>70% yellow 40-70% gray<40%), Application Tracker (Applied→Interview→Offer/Rejected), AI chat controls filters directly.
To upload resume: click 📄 button in header. To see applications: click "My Applications" tab.`),
      ...history,
      new HumanMessage(state.userMessage),
    ]);
    return { assistantMessage: response.content.toString(), uiAction: { type: "NONE", payload: {} }, processingStep: "help_node" };
  } catch (err) {
    console.error("[Help] Error:", err.message);
    return { assistantMessage: "I can help you find jobs, update filters, or answer questions! Try: 'Show remote React jobs'", uiAction: { type: "NONE", payload: {} } };
  }
}
