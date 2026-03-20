// JobCard.jsx - Shows "Applied ✓" if already applied, with resume tips + cover letter
import { useState } from "react";
import { useApplyFlow } from "../../hooks/useApplyFlow.js";
import { getScoreBadge } from "../../utils/scoring.js";
import { getResumeTips, generateCoverLetter } from "../../services/api.js";
import { useStore } from "../../store/index.js";
import { toast } from "../../utils/toast.js";

export default function JobCard({ job, index = 0, highlight = false }) {
  const { handleApply } = useApplyFlow();
  const { applications } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [tips, setTips] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);

  const badge = getScoreBadge(job.matchScore || 0);
  const workModeEmoji = { remote: "🌐", hybrid: "🏠", "on-site": "🏢" }[job.workMode] || "📍";
  const timeAgo = getTimeAgo(job.postedAt);

  // Check if this job has already been applied to
  const appliedApp = applications.find(a => a.jobId === job.id || a.jobTitle === job.title);
  const isApplied = !!appliedApp;

  const handleGetTips = async () => {
    if (tips) { setTips(null); return; }
    setLoadingTips(true);
    toast.info("⏳ Generating tips... (~3 seconds)");
    try {
      const data = await getResumeTips(job.title, job.description, job.skills);
      setTips(data.tips);
    } catch {
      toast.error("Failed to get tips. Try again.");
    } finally {
      setLoadingTips(false);
    }
  };

  const handleCoverLetter = async () => {
    if (coverLetter) { setCoverLetter(null); return; }
    setLoadingCover(true);
    toast.info("⏳ Generating cover letter... (~5 seconds)");
    try {
      const data = await generateCoverLetter(job.title, job.company, job.description);
      setCoverLetter(data.coverLetter);
    } catch {
      toast.error("Failed to generate. Try again.");
    } finally {
      setLoadingCover(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{
      animationDelay: `${index * 40}ms`,
      borderColor: isApplied ? "rgba(16,185,129,0.3)" : highlight ? "var(--border-strong)" : "var(--border)",
      background: isApplied
        ? "linear-gradient(135deg, var(--bg-card), rgba(16,185,129,0.04))"
        : highlight
        ? "linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.04))"
        : "var(--bg-card)",
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Company logo */}
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: `hsl(${(job.company?.charCodeAt(0)||65)*7%360},40%,20%)`,
          border: "1px solid var(--border)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "18px", flexShrink: 0,
          fontWeight: "700", color: `hsl(${(job.company?.charCodeAt(0)||65)*7%360},70%,70%)`,
        }}>
          {job.company?.[0]?.toUpperCase() || "?"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "700" }}>
                  {job.title}
                </h3>
                {/* Applied badge */}
                {isApplied && (
                  <span style={{
                    padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700",
                    background: "rgba(16,185,129,0.15)", color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}>
                    ✓ Applied
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "3px" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>{job.company}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>• 📍 {job.location}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>• {workModeEmoji} {job.workMode}</span>
                {job.salary && <span style={{ color: "var(--score-high)", fontSize: "12px" }}>• 💰 {job.salary}</span>}
              </div>
            </div>

            {/* Score ring */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: "700",
              border: `2px solid ${badge.color}`, color: badge.color,
              background: badge.bg, flexShrink: 0,
            }}>
              {job.matchScore > 0 ? `${job.matchScore}%` : "—"}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            <span className="chip" style={{ fontSize: "11px" }}>{job.jobType}</span>
            {job.skills?.slice(0, 4).map(skill => (
              <span key={skill} className="chip" style={{ fontSize: "11px" }}>{skill}</span>
            ))}
            {job.skills?.length > 4 && (
              <span className="chip" style={{ fontSize: "11px", color: "var(--text-muted)" }}>+{job.skills.length - 4}</span>
            )}
          </div>

          {/* Expanded description */}
          {expanded && (
            <div style={{ marginTop: "12px", padding: "12px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.7" }}>
                {job.description?.slice(0, 600)}{job.description?.length > 600 ? "..." : ""}
              </p>
              {job.matchExplanation && job.matchScore > 0 && (
                <div style={{ marginTop: "10px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>
                    Why this matches you
                  </p>
                  {job.matchExplanation.matchingSkills?.length > 0 && (
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "3px" }}>
                      <strong style={{ color: "var(--score-high)" }}>✓ Skills:</strong> {job.matchExplanation.matchingSkills.join(", ")}
                    </p>
                  )}
                  {job.matchExplanation.relevantExperience && (
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--accent)" }}>✓ Experience:</strong> {job.matchExplanation.relevantExperience}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resume Tips */}
          {tips && (
            <div style={{ marginTop: "10px", padding: "12px", background: "rgba(99,102,241,0.06)", borderRadius: "8px", border: "1px solid var(--border-strong)" }}>
              <p style={{ fontSize: "11px", color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
                💡 Resume Tips for This Role
              </p>
              {tips.map((tip, i) => (
                <p key={i} style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "700", flexShrink: 0 }}>{i + 1}.</span>
                  {tip}
                </p>
              ))}
            </div>
          )}

          {/* Cover Letter */}
          {coverLetter && (
            <div style={{ marginTop: "10px", padding: "14px", background: "rgba(16,185,129,0.05)", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", color: "var(--score-high)", fontWeight: "700", textTransform: "uppercase" }}>
                  📧 Generated Cover Letter
                </p>
                <button
                  onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success("✅ Copied to clipboard!"); }}
                  style={{ background: "none", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px", padding: "3px 8px" }}
                >
                  Copy
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {coverLetter}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {/* Apply / Applied button */}
              {isApplied ? (
                <button
                  disabled
                  style={{
                    padding: "7px 18px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.4)",
                    background: "rgba(16,185,129,0.12)", color: "#10b981",
                    fontSize: "13px", fontWeight: "600", cursor: "default",
                    fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button className="btn btn-primary" style={{ padding: "7px 18px", fontSize: "13px" }} onClick={() => handleApply(job)}>
                  Apply →
                </button>
              )}

              <button className="btn btn-secondary" style={{ padding: "7px 12px", fontSize: "12px" }} onClick={() => setExpanded(!expanded)}>
                {expanded ? "Less" : "Details"}
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: "7px 12px", fontSize: "12px" }}
                onClick={handleGetTips}
                disabled={loadingTips}
              >
                {loadingTips ? "⏳ Loading..." : tips ? "Hide Tips" : "💡 Tips"}
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: "7px 12px", fontSize: "12px" }}
                onClick={handleCoverLetter}
                disabled={loadingCover}
              >
                {loadingCover ? "⏳ Loading..." : coverLetter ? "Hide Letter" : "📧 Cover Letter"}
              </button>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
