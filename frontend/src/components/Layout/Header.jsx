// Header.jsx - Clean mobile header with bottom navigation
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
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.info("Signed out");
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header - Logo + AI + Menu */}
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "var(--header-height)",
          background: "color-mix(in srgb, var(--bg-base) 95%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px",
        }}>
          {/* Left: Filter + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {activeTab === "feed" && (
              <button onClick={onFilterClick} style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer", fontSize: "15px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>☰</button>
            )}
            <span style={{
              width: "26px", height: "26px", borderRadius: "7px",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", boxShadow: "0 0 8px rgba(99,102,241,0.4)",
            }}>⚡</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "15px" }}>
              Jobs<span style={{ color: "var(--accent)" }}>TrackerAI</span>
            </span>
          </div>

          {/* Right: AI + Theme + Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={toggleChat} style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: chatOpen ? "var(--accent)" : "var(--bg-elevated)",
              border: "1px solid var(--border)", color: chatOpen ? "#fff" : "var(--text-secondary)",
              cursor: "pointer", fontSize: "15px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>🤖</button>

            <button onClick={toggleTheme} style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{theme === "dark" ? "☀️" : "🌙"}</button>

            {/* Hamburger menu for Resume + Signout */}
            <button onClick={() => setShowMenu(!showMenu)} style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "15px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>⋮</button>
          </div>
        </header>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 110 }} />
            <div style={{
              position: "fixed", top: "calc(var(--header-height) + 4px)", right: "14px",
              background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
              borderRadius: "12px", padding: "8px", zIndex: 111,
              boxShadow: "var(--shadow-elevated)", minWidth: "180px",
            }}>
              {/* User info */}
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "6px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Signed in as</p>
                <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "600" }}>
                  {user?.email}
                </p>
              </div>

              {/* Resume */}
              <button onClick={() => { setShowMenu(false); setShowResume(true); }} style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                background: resumeInfo?.hasResume ? "rgba(16,185,129,0.08)" : "transparent",
                border: "none", color: resumeInfo?.hasResume ? "#10b981" : "var(--text-primary)",
                cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                textAlign: "left", display: "flex", alignItems: "center", gap: "8px",
              }}>
                📄 {resumeInfo?.hasResume ? "Resume ✓" : "Upload Resume"}
              </button>

              {/* Sign out */}
              <button onClick={() => { setShowMenu(false); handleLogout(); }} style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                background: "transparent", border: "none",
                color: "#ef4444", cursor: "pointer", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                🚪 Sign Out
              </button>
            </div>
          </>
        )}

        {/* Mobile Bottom Navigation */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "56px", background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 16px",
        }}>
          {[
            { key: "feed", label: "Job Feed", icon: "🔍" },
            { key: "tracker", label: "Applications", icon: "📋" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              background: "none", border: "none", cursor: "pointer",
              color: activeTab === tab.key ? "var(--accent)" : "var(--text-muted)",
              padding: "6px 20px", borderRadius: "10px",
              background: activeTab === tab.key ? "var(--accent-dim)" : "transparent",
              position: "relative",
            }}>
              <span style={{ fontSize: "20px" }}>{tab.icon}</span>
              <span style={{ fontSize: "10px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif" }}>
                {tab.label}
              </span>
              {tab.key === "tracker" && applications.length > 0 && (
                <span style={{
                  position: "absolute", top: "2px", right: "8px",
                  background: "var(--accent)", color: "#fff",
                  borderRadius: "99px", padding: "1px 5px", fontSize: "9px", fontWeight: "700",
                }}>
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {showResume && <ResumeManager onClose={() => setShowResume(false)} />}
      </>
    );
  }

  // ── Desktop Header ──────────────────────────────────────────────────────────
  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "var(--header-height)",
        background: "color-mix(in srgb, var(--bg-base) 90%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
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
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeTab === tab.key ? "var(--accent-dim)" : "transparent",
              color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "500",
              borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: "6px",
            }}>
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
          <button onClick={toggleChat} style={{
            padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border)",
            background: chatOpen ? "var(--accent)" : "var(--bg-elevated)",
            color: chatOpen ? "#fff" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
            fontWeight: "500", display: "flex", alignItems: "center", gap: "6px",
          }}>🤖 AI</button>

          <button onClick={toggleTheme} style={{
            padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg-elevated)", color: "var(--text-secondary)",
            cursor: "pointer", fontSize: "14px",
          }}>{theme === "dark" ? "☀️" : "🌙"}</button>

          <button onClick={() => setShowResume(true)} style={{
            padding: "7px 12px", borderRadius: "8px",
            border: `1px solid ${resumeInfo?.hasResume ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
            background: resumeInfo?.hasResume ? "rgba(16,185,129,0.08)" : "var(--bg-elevated)",
            color: resumeInfo?.hasResume ? "#10b981" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: "500",
            display: "flex", alignItems: "center", gap: "5px",
          }}>📄 Resume {resumeInfo?.hasResume ? "✓" : ""}</button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "700", color: "#fff",
            }}>{user?.email?.[0]?.toUpperCase() || "U"}</div>
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
