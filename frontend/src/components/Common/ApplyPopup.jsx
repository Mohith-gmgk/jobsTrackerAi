// frontend/src/components/Common/ApplyPopup.jsx
import { useStore } from "../../store/index.js";
import { useApplyFlow } from "../../hooks/useApplyFlow.js";

export default function ApplyPopup() {
  const { applyPopup } = useStore();
  const { handlePopupResponse } = useApplyFlow();

  if (!applyPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => handlePopupResponse("no")}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", zIndex: 300,
        }}
      />

      {/* Modal */}
      <div
        className="animate-slide-up"
        style={{
          position: "fixed", bottom: "50%", left: "50%",
          transform: "translate(-50%, 50%)",
          width: "100%", maxWidth: "420px",
          background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-lg)", padding: "28px",
          boxShadow: "var(--shadow-elevated)", zIndex: 301,
        }}
      >
        {/* Icon */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "14px",
          background: "var(--accent-dim)", border: "1px solid var(--border-strong)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", marginBottom: "16px",
        }}>
          📋
        </div>

        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
          Did you apply?
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
          <strong style={{ color: "var(--text-primary)" }}>{applyPopup.jobTitle}</strong>
          {" "}at{" "}
          <strong style={{ color: "var(--accent)" }}>{applyPopup.company}</strong>
        </p>

        {applyPopup.matchScore > 0 && (
          <div style={{
            padding: "10px 14px", borderRadius: "8px",
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              border: `2px solid ${applyPopup.matchScore >= 70 ? "var(--score-high)" : applyPopup.matchScore >= 40 ? "var(--score-medium)" : "var(--score-low)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontWeight: "700", fontSize: "11px",
              color: applyPopup.matchScore >= 70 ? "var(--score-high)" : applyPopup.matchScore >= 40 ? "var(--score-medium)" : "var(--score-low)",
            }}>
              {applyPopup.matchScore}%
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {applyPopup.matchScore >= 70 ? "Great match! This role suits your profile well." : applyPopup.matchScore >= 40 ? "Decent match. Worth trying!" : "Lower match, but go for it if you're interested."}
            </p>
          </div>
        )}

        {/* Response buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            onClick={() => handlePopupResponse("yes")}
          >
            ✅ Yes, I Applied
          </button>
          <button
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            onClick={() => handlePopupResponse("earlier")}
          >
            📅 Applied Earlier
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "13px" }}
            onClick={() => handlePopupResponse("no")}
          >
            No, just browsing
          </button>
        </div>
      </div>
    </>
  );
}
