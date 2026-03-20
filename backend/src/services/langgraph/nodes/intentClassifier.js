// intentClassifier.js - LangGraph node + Groq via LangChain
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  maxTokens: 100,
  apiKey: process.env.GROQ_API_KEY,
});

export async function intentClassifierNode(state) {
  try {
    const response = await model.invoke([
      new SystemMessage(`Classify the user message into one intent. Reply ONLY with JSON.
{"intent":"filter_update","confidence":0.95}

Intents:
- job_search: find/show jobs ("show me react jobs", "find ML roles")
- filter_update: change filters ("only remote", "full-time", "last 24 hours", "jobs in Bangalore")
- clear_filters: reset ("clear all filters", "show all jobs", "reset")
- help: questions ("how does matching work", "where are my applications", "how to upload resume")`),
      new HumanMessage(state.userMessage),
    ]);

    const text = response.content.toString().trim().replace(/```json/g,"").replace(/```/g,"").trim();
    console.log("[Intent]", text);
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: "help", confidence: 0.5 };
    return { intent: parsed.intent || "help", intentConfidence: parsed.confidence || 0.5, processingStep: "intent_classifier" };
  } catch (err) {
    console.error("[Intent] Error:", err.message);
    return { intent: "help", intentConfidence: 0, error: err.message };
  }
}
