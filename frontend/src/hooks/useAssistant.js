// useAssistant.js - VERSION 2 - FIXED
import { useCallback } from "react";
import { useStore } from "../store/index.js";
import { sendAssistantMessage } from "../services/api.js";
import { toast } from "../utils/toast.js";

export function useAssistant() {
  const { chatMessages, addChatMessage, setChatLoading, applyFilterActions, filters } = useStore();

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim()) return;
    addChatMessage({ role: "user", content: userText });
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await sendAssistantMessage(userText, history, filters);

      console.log("✅ AI Response:", JSON.stringify(response));

      if (response.uiAction?.type === "UPDATE_FILTERS") {
        applyFilterActions(response.uiAction.payload);
        toast.info("🎯 Filters updated by AI");
      }

      const msg = response.message || response.assistantMessage || "Done! ✅";
      addChatMessage({ role: "assistant", content: msg });

    } catch (err) {
      console.error("❌ Assistant error:", err);
      addChatMessage({ role: "assistant", content: `Error: ${err.message}` });
    } finally {
      setChatLoading(false);
    }
  }, [chatMessages, addChatMessage, setChatLoading, applyFilterActions, filters]);

  return { sendMessage };
}
