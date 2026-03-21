// MainPage.jsx - Mobile responsive with filter drawer
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/index.js";
import { getResumeInfo } from "../services/api.js";
import { useJobFeed } from "../hooks/useJobFeed.js";
import Header from "../components/Layout/Header.jsx";
import FilterPanel from "../components/Filters/FilterPanel.jsx";
import JobFeed from "../components/JobFeed/JobFeed.jsx";
import ApplicationTracker from "../components/ApplicationTracker/ApplicationTracker.jsx";
import AIAssistantBubble from "../components/AIAssistant/AIAssistantBubble.jsx";
import ApplyPopup from "../components/Common/ApplyPopup.jsx";

export default function MainPage() {
  const { activeTab, setResumeInfo, setResumeText, user } = useStore();
  const { reload } = useJobFeed();
  const hasLoaded = useRef(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user || hasLoaded.current) return;
    hasLoaded.current = true;
    getResumeInfo()
      .then((info) => {
        setResumeInfo(info);
        if (info?.resumeText && info.resumeText.length > 50) {
          setResumeText(info.resumeText);
          setTimeout(() => reload(), 300);
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header onFilterClick={() => setFilterOpen(true)} isMobile={isMobile} />

      {/* Mobile filter drawer */}
      {isMobile && filterOpen && (
        <>
          <div
            onClick={() => setFilterOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 150, backdropFilter: "blur(4px)" }}
          />
          <div style={{
            position: "fixed", left: 0, top: 0, bottom: 0, width: "85%", maxWidth: "320px",
            background: "var(--bg-surface)", zIndex: 151, padding: "20px",
            overflowY: "auto", boxShadow: "4px 0 30px rgba(0,0,0,0.4)",
            animation: "slideRight 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "800" }}>🔧 Filters</h3>
              <button onClick={() => setFilterOpen(false)} style={{
                background: "#ef4444", border: "none", color: "#fff",
                width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", fontSize: "14px", fontWeight: "800",
              }}>✕</button>
            </div>
            <FilterPanel onApply={() => setFilterOpen(false)} />
          </div>
        </>
      )}

      <div style={{
        display: "flex", flex: 1,
        maxWidth: "1400px", margin: "0 auto", width: "100%",
        padding: isMobile
          ? `calc(var(--header-height) + 16px) 12px 80px`
          : `calc(var(--header-height) + 24px) 24px 24px`,
        gap: "24px",
      }}>
        {/* Desktop sidebar */}
        {!isMobile && activeTab === "feed" && (
          <aside style={{ width: "300px", flexShrink: 0 }}>
            <FilterPanel />
          </aside>
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "feed" ? <JobFeed isMobile={isMobile} onFilterClick={() => setFilterOpen(true)} /> : <ApplicationTracker />}
        </main>
      </div>

      <AIAssistantBubble />
      <ApplyPopup />

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
