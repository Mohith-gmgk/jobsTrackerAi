// AIAssistantBubble.jsx - With voice input bonus feature
import { useState, useRef, useEffect } from "react";
import { useStore } from "../../store/index.js";
import { useAssistant } from "../../hooks/useAssistant.js";
import { useVoiceInput } from "../../hooks/useVoiceInput.js";
import { toast } from "../../utils/toast.js";

const QUICK_PROMPTS = [
  "Show remote React jobs",
  "Filter by last 24 hours",
  "High match score only",
  "Clear all filters",
  "How does matching work?",
];

export default function AIAssistantBubble() {
  const { chatOpen, chatMessages, chatLoading, toggleChat } = useStore();
  const { sendMessage } = useAssistant();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Voice input hook
  const { isListening, startListening, stopListening } = useVoiceInput({
    onResult: (transcript) => {
      setInput(transcript);
      // Auto-send after voice input
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage(transcript.trim());
          setInput("");
        }
      }, 500);
    },
    onError: (err) => toast.error("Voice: " + err),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {chatOpen && (
        <div className="animate-slide-up" style={{
          position: "fixed", bottom: "90px", right: "24px",
          width: "380px", height: "520px",
          background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-elevated)",
          display: "flex", flexDirection: "column", zIndex: 200, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "12px",
            background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 0 12px rgba(99,102,241,0.4)",
            }}>🤖</div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: "700", fontSize: "14px" }}>JobAI Assistant</p>
              <p style={{ fontSize: "11px", color: "var(--score-high)" }}>● Online · Controls your filters</p>
            </div>
            <button onClick={toggleChat} style={{ marginLeft: "auto", width: "28px", height: "28px", borderRadius: "50%", background: "#ef4444", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.6" }}>
                  👋 Hi! I can <strong style={{ color: "var(--accent)" }}>search jobs</strong>, <strong style={{ color: "var(--accent)" }}>update filters</strong>, or answer questions.
                  <br/><span style={{ fontSize: "11px", color: "var(--text-muted)" }}>🎙️ Try voice input!</span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => sendMessage(p)} style={{
                      background: "var(--bg-elevated)", border: "1px solid var(--border)",
                      borderRadius: "8px", padding: "8px 12px", color: "var(--text-secondary)",
                      fontSize: "12px", cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif",
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-secondary)"; }}
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className="animate-fade-in" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? "#ffffff" : "var(--bg-elevated)",
                  color: msg.role === "user" ? "#1a1d3a" : "var(--text-primary)",
                  boxShadow: msg.role === "user" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                  fontSize: "13px", lineHeight: "1.5",
                  border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                }}>
                  <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "14px 14px 14px 4px", border: "1px solid var(--border)", display: "flex", gap: "4px" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease infinite ${i*0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input with voice button */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                ref={inputRef}
                className="input"
                placeholder={isListening ? "🎙️ Listening..." : "Ask anything or say 'show remote jobs'..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, padding: "9px 12px", fontSize: "13px", borderColor: isListening ? "var(--score-high)" : undefined }}
                disabled={chatLoading || isListening}
              />
              {/* Voice button */}
              <button
                onClick={isListening ? stopListening : startListening}
                style={{
                  padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                  background: isListening ? "rgba(16,185,129,0.15)" : "var(--bg-elevated)",
                  color: isListening ? "var(--score-high)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: "16px", flexShrink: 0,
                  animation: isListening ? "pulse 1s ease infinite" : "none",
                }}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                🎙️
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!input.trim() || chatLoading}
                style={{ padding: "9px 16px", flexShrink: 0 }}
              >
                →
              </button>
            </div>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "6px", textAlign: "center" }}>
              Powered by Claude (LangGraph) · Controls your filters · 🎙️ Voice enabled
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          background: chatOpen ? "#ef4444" : "linear-gradient(135deg, #6366f1, #818cf8)",
          border: "none",
          boxShadow: chatOpen ? "0 0 16px rgba(239,68,68,0.4)" : "0 0 24px rgba(99,102,241,0.5)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: chatOpen ? "24px" : "22px", zIndex: 201, transition: "all 0.3s ease",
          color: "#ffffff", fontWeight: "700",
        }}
      >
        {chatOpen ? "✕" : "🤖"}
      </button>
    </>
  );
}
