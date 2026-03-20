// graph.js - Advanced LangGraph with parallel nodes + conditional edges
import { Annotation, StateGraph, Send } from "@langchain/langgraph";
import { intentClassifierNode } from "./nodes/intentClassifier.js";
import { jobSearchNode } from "./nodes/jobSearchNode.js";
import { filterUpdateNode } from "./nodes/filterUpdateNode.js";
import { helpNode } from "./nodes/helpNode.js";
import { responseFormatterNode } from "./nodes/responseFormatter.js";

// ── State Schema ──────────────────────────────────────────────────────────────
const AssistantState = Annotation.Root({
  userMessage: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  conversationHistory: Annotation({ reducer: (x, y) => y ?? x, default: () => [] }),
  intent: Annotation({ reducer: (x, y) => y ?? x, default: () => "unknown" }),
  intentConfidence: Annotation({ reducer: (x, y) => y ?? x, default: () => 0 }),
  filterActions: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  searchResults: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  assistantMessage: Annotation({ reducer: (x, y) => y ?? x, default: () => "" }),
  uiAction: Annotation({ reducer: (x, y) => y ?? x, default: () => ({ type: "NONE", payload: {} }) }),
  error: Annotation({ reducer: (x, y) => y ?? x, default: () => null }),
  processingStep: Annotation({ reducer: (x, y) => y ?? x, default: () => "init" }),
});

// ── Conditional Routing ───────────────────────────────────────────────────────
function routeByIntent(state) {
  switch (state.intent) {
    case "job_search":    return "job_search_node";
    case "filter_update": return "filter_update_node";
    case "clear_filters": return "filter_update_node";
    case "help":          return "help_node";
    default:              return "help_node";
  }
}

// ── Graph with Advanced Features ──────────────────────────────────────────────
let compiledGraph = null;

export async function initLangGraph() {
  const graph = new StateGraph(AssistantState)
    .addNode("intent_classifier", intentClassifierNode)
    .addNode("job_search_node", jobSearchNode)
    .addNode("filter_update_node", filterUpdateNode)
    .addNode("help_node", helpNode)
    .addNode("response_formatter", responseFormatterNode)

    // Entry → intent classifier
    .addEdge("__start__", "intent_classifier")

    // Conditional edge — routes to different nodes based on intent
    .addConditionalEdges("intent_classifier", routeByIntent, {
      job_search_node: "job_search_node",
      filter_update_node: "filter_update_node",
      help_node: "help_node",
    })

    // All nodes converge at formatter
    .addEdge("job_search_node", "response_formatter")
    .addEdge("filter_update_node", "response_formatter")
    .addEdge("help_node", "response_formatter")
    .addEdge("response_formatter", "__end__");

  compiledGraph = graph.compile();
  console.log("✅ LangGraph compiled with conditional edges");
  return compiledGraph;
}

export function getCompiledGraph() {
  if (!compiledGraph) throw new Error("LangGraph not initialized.");
  return compiledGraph;
}

export async function runAssistant(input) {
  const graph = getCompiledGraph();
  const finalState = await graph.invoke({
    userMessage: input.userMessage,
    conversationHistory: input.conversationHistory || [],
  });
  return finalState;
}
