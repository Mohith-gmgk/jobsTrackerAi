// Header.jsx - Mobile responsive with hamburger filter button
import { useState } from "react";
import { useStore } from "../../store/index.js";
import { logout } from "../../services/firebase.js";
import { toast } from "../../utils/toast.js";
import { useNavigate } from "react-router-dom";
import ResumeManager from "../Resume/ResumeManager.jsx";

export default function Header({ onFilterClick, isMobile }) {
  const { activeTab, setActiveTab, user, applications, chatOpen, toggleChat, resumeInfo, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [showResume, setShowResume] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.info("Signed out");
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "var(--header-height)",
        background: "color-mix(in srgb, var(--bg-base) 90%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 12px" : "0 24px",
      }}>
        {/* Left: Filter button (mobile) + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Mobile filter button */}
          {isMobile && activeTab === "feed" && (
            <button onClick={onFilterClick} style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              ☰
            </button>
          )}

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", boxShadow: "0 0 10px rgba(99,102,241,0.4)",
            }}>⚡</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: isMobile ? "14px" : "18px" }}>
              Jobs<span style={{ color: "var(--accent)" }}>TrackerAI</span>
            </span>
          </div>
        </div>

        {/* Center: Tab navigation */}
        <nav style={{ display: "flex", gap: "2px" }}>
          {[
            { key: "feed", label: isMobile ? "🔍" : "🔍 Job Feed" },
            { key: "tracker", label: isMobile ? "📋" : "📋 Applications" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: isMobile ? "6px 10px" : "6px 16px",
                borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "var(--accent-dim)" : "transparent",
                color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? "16px" : "13px",
                fontWeight: "500",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: "4px",
                position: "relative",
              }}
            >
              {tab.label}
              {tab.key === "tracker" && applications.length > 0 && (
                <span style={{
                  background: "var(--accent)", color: "#fff",
                  borderRadius: "99px", padding: "1px 6px", fontSize: "10px", fontWeight: "700",
                }}>
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "8px" }}>
          {/* AI toggle */}
          <button onClick={toggleChat} style={{
            padding: isMobile ? "6px 8px" : "7px 14px",
            borderRadius: "8px", border: "1px solid var(--border)",
            background: chatOpen ? "var(--accent)" : "var(--bg-elevated)",
            color: chatOpen ? "#fff" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: isMobile ? "16px" : "12px", fontWeight: "500",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            {isMobile ? "🤖" : "🤖 AI"}
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            padding: "6px 8px", borderRadius: "8px",
            border: "1px solid var(--border)", background: "var(--bg-elevated)",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px",
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Resume - icon only on mobile */}
          <button onClick={() => setShowResume(true)} style={{
            padding: isMobile ? "6px 8px" : "7px 12px",
            borderRadius: "8px",
            border: `1px solid ${resumeInfo?.hasResume ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
            background: resumeInfo?.hasResume ? "rgba(16,185,129,0.08)" : "var(--bg-elevated)",
            color: resumeInfo?.hasResume ? "#10b981" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: isMobile ? "14px" : "12px", fontWeight: "500",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            {isMobile ? (resumeInfo?.hasResume ? "📄✓" : "📄") : `📄 Resume ${resumeInfo?.hasResume ? "✓" : ""}`}
          </button>

          {/* User avatar */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "700", color: "#fff",
              }}>
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "11px" }}>
                Sign out
              </button>
            </div>
          )}

          {/* Mobile: just avatar that signs out on tap */}
          {isMobile && (
            <button onClick={handleLogout} style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              border: "none", color: "#fff", cursor: "pointer",
              fontSize: "11px", fontWeight: "700",
            }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </button>
          )}
        </div>
      </header>

      {showResume && <ResumeManager onClose={() => setShowResume(false)} />}
    </>
  );
}
