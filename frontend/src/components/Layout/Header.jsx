// Header.jsx - Theme toggle + Resume label + improved UI
import { useState } from "react";
import { useStore } from "../../store/index.js";
import { logout } from "../../services/firebase.js";
import { toast } from "../../utils/toast.js";
import { useNavigate } from "react-router-dom";
import ResumeManager from "../Resume/ResumeManager.jsx";

export default function Header() {
  const { activeTab, setActiveTab, user, applications, chatOpen, toggleChat, resumeInfo, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [showResume, setShowResume] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.info("Signed out successfully");
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "var(--header-height)",
        background: "rgba(var(--bg-base-rgb, 13,15,26), 0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", backgroundColor: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", boxShadow: "0 0 12px rgba(99,102,241,0.4)",
          }}>⚡</span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "18px" }}>
            Jobs<span style={{ color: "var(--accent)" }}>TrackerAI</span>
          </span>
        </div>

        {/* Tabs */}
        <nav style={{ display: "flex", gap: "4px" }}>
          {[
            { key: "feed", label: "Job Feed", icon: "🔍" },
            { key: "tracker", label: "My Applications", icon: "📋" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "var(--accent-dim)" : "transparent",
                color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "500",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {tab.icon} {tab.label}
              {tab.key === "tracker" && applications.length > 0 && (
                <span style={{ background: "var(--accent)", color: "#fff", borderRadius: "99px", padding: "1px 7px", fontSize: "10px", fontWeight: "700" }}>
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* AI toggle */}
          <button onClick={toggleChat} style={{
            padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border)",
            background: chatOpen ? "var(--accent)" : "var(--bg-elevated)",
            color: chatOpen ? "#fff" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
            fontWeight: "500", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease",
          }}>
            🤖 AI
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg-elevated)", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: "14px", transition: "all 0.2s ease",
          }} title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Resume button */}
          <button onClick={() => setShowResume(true)} style={{
            padding: "7px 12px", borderRadius: "8px",
            border: `1px solid ${resumeInfo?.hasResume ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
            background: resumeInfo?.hasResume ? "rgba(16,185,129,0.08)" : "var(--bg-elevated)",
            color: resumeInfo?.hasResume ? "#10b981" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
            fontWeight: "500", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.2s ease",
          }}>
            📄 Resume {resumeInfo?.hasResume ? "✓" : ""}
          </button>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700", color: "#fff",
            }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {showResume && <ResumeManager onClose={() => setShowResume(false)} />}
    </>
  );
}
