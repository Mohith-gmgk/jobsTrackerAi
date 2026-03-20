// MainPage.jsx - Clean version, no double calls
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!user || hasLoaded.current) return;
    hasLoaded.current = true;

    getResumeInfo()
      .then((info) => {
        setResumeInfo(info);
        if (info?.resumeText && info.resumeText.length > 50) {
          setResumeText(info.resumeText);
          console.log("✅ Resume loaded:", info.resumeText.length, "chars");
          // Reload jobs with resume text after short delay
          setTimeout(() => reload(), 300);
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{
        display: "flex", flex: 1,
        maxWidth: "1400px", margin: "0 auto", width: "100%",
        padding: `calc(var(--header-height) + 24px) 24px 24px`,
        gap: "24px",
      }}>
        {activeTab === "feed" && (
          <aside style={{ width: "var(--sidebar-width)", flexShrink: 0 }}>
            <FilterPanel />
          </aside>
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "feed" ? <JobFeed /> : <ApplicationTracker />}
        </main>
      </div>
      <AIAssistantBubble />
      <ApplyPopup />
    </div>
  );
}
