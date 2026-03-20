// ApplicationTracker.jsx - Complete rewrite with all fixes
import { useEffect, useState } from "react";
import { useStore } from "../../store/index.js";
import { getApplications, updateApplicationStatus, deleteApplication } from "../../services/api.js";
import { toast } from "../../utils/toast.js";

const STATUS_CONFIG = {
  applied:   { label: "Applied",   color: "#6366f1", emoji: "📤", next: ["interview", "rejected"] },
  interview: { label: "Interview", color: "#f59e0b", emoji: "🎙️", next: ["offer", "rejected"] },
  offer:     { label: "Offer",     color: "#10b981", emoji: "🎉", next: [] },
  rejected:  { label: "Rejected",  color: "#ef4444", emoji: "❌", next: [] },
};

// ── Pie Chart Component ───────────────────────────────────────────────────────
function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const slices = data.filter(d => d.value > 0).map(d => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  const getCoords = (pct) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return [50 + 40 * Math.cos(angle), 50 + 40 * Math.sin(angle)];
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <svg viewBox="0 0 100 100" width="140" height="140" style={{ flexShrink: 0 }}>
        {slices.map((slice, i) => {
          const [x1, y1] = getCoords(slice.start);
          const [x2, y2] = getCoords(slice.start + slice.pct);
          const large = slice.pct > 0.5 ? 1 : 0;
          const path = slice.pct >= 1
            ? `M 50 10 A 40 40 0 1 1 49.99 10 Z`
            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${large} 1 ${x2} ${y2} Z`;
          return (
            <path key={i} d={path} fill={slice.color} opacity="0.9">
              <title>{slice.label}: {slice.value}</title>
            </path>
          );
        })}
        {/* Center hole */}
        <circle cx="50" cy="50" r="22" fill="var(--bg-card)" />
        <text x="50" y="47" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontFamily="Syne" fontWeight="700">{total}</text>
        <text x="50" y="57" textAnchor="middle" fill="var(--text-muted)" fontSize="6">total</text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: slice.color, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                {slice.emoji} {slice.label}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {slice.value} app{slice.value !== 1 ? "s" : ""} · {Math.round(slice.pct * 100)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Follow-up Notification Banner ─────────────────────────────────────────────
function FollowUpBanner({ applications }) {
  const now = new Date();
  const needsFollowUp = applications.filter(app => {
    if (app.status !== "applied") return false;
    const appliedDate = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
    const days = Math.floor((now - appliedDate) / 86400000);
    return days >= 3;
  });

  if (!needsFollowUp.length) return null;

  return (
    <div style={{
      padding: "16px 20px", borderRadius: "12px",
      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
      marginBottom: "8px",
    }}>
      <p style={{ fontSize: "15px", fontWeight: "700", color: "#f59e0b", marginBottom: "10px" }}>
        ⏰ Follow-up Reminders — {needsFollowUp.length} pending application{needsFollowUp.length !== 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {needsFollowUp.map(app => {
          const ts2 = app.appliedAt;
          let appliedDate;
          if (!ts2) appliedDate = new Date();
          else if (typeof ts2.toDate === "function") appliedDate = ts2.toDate();
          else if (ts2._seconds) appliedDate = new Date(ts2._seconds * 1000);
          else if (ts2.seconds) appliedDate = new Date(ts2.seconds * 1000);
          else appliedDate = new Date(ts2);
          const days = Math.floor((now - appliedDate) / 86400000);
          return (
            <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                <strong>{app.jobTitle}</strong> at <strong>{app.company}</strong>
              </p>
              <span style={{
                padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600",
                background: days >= 14 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                color: days >= 14 ? "#ef4444" : "#f59e0b",
                flexShrink: 0,
              }}>
                {days >= 14 ? `${days}d — Move on?` : `${days}d — Follow up!`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ApplicationTracker() {
  const { applications, setApplications, updateApplication, removeApplication } = useStore();
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    getApplications()
      .then(data => setApplications(data.applications || []))
      .catch(err => toast.error("Failed to load: " + err.message))
      .finally(() => setLoading(false));
  }, [setApplications]);

  const handleStatusUpdate = async (app, newStatus) => {
    try {
      await updateApplicationStatus(app.id, newStatus);
      updateApplication(app.id, {
        status: newStatus,
        timeline: [...(app.timeline || []), { status: newStatus, changedAt: new Date() }],
      });
      toast.success(`✅ Moved to ${STATUS_CONFIG[newStatus]?.label}`);
    } catch { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this application?")) return;
    try {
      await deleteApplication(id);
      removeApplication(id);
      toast.info("Removed");
    } catch { toast.error("Delete failed"); }
  };

  const grouped = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s);
    return acc;
  }, {});

  const pieData = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    label: cfg.label, emoji: cfg.emoji,
    value: grouped[key]?.length || 0,
    color: cfg.color,
  }));

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {[1,2,3].map(i => <div key={i} className="card" style={{ height: "90px", animation: "pulse 1.5s ease infinite" }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Page Header */}
      <div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: "800", marginBottom: "6px" }}>
          My Applications
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          {applications.length} total applications · Track your pipeline
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>No applications yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Click "Apply →" on any job, confirm when you return — it'll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Follow-up reminders */}
          <FollowUpBanner applications={applications} />

          {/* Stats + Pie Chart */}
          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "var(--text-primary)" }}>
              📊 Application Overview
            </p>
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Pie chart */}
              <PieChart data={pieData} />

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", flex: 1 }}>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                  <div key={status} style={{
                    padding: "16px", borderRadius: "12px",
                    background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`,
                  }}>
                    <div style={{ fontSize: "26px", marginBottom: "6px" }}>{cfg.emoji}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: "800", color: cfg.color }}>
                      {grouped[status]?.length || 0}
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600", marginTop: "4px" }}>
                      {cfg.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success rate */}
            {applications.length > 0 && (
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Interview Rate</p>
                  <p style={{ fontSize: "22px", fontFamily: "'Syne', sans-serif", fontWeight: "800", color: "#f59e0b" }}>
                    {Math.round(((grouped.interview?.length || 0) + (grouped.offer?.length || 0)) / applications.length * 100)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Offer Rate</p>
                  <p style={{ fontSize: "22px", fontFamily: "'Syne', sans-serif", fontWeight: "800", color: "#10b981" }}>
                    {Math.round((grouped.offer?.length || 0) / applications.length * 100)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Match Score</p>
                  <p style={{ fontSize: "22px", fontFamily: "'Syne', sans-serif", fontWeight: "800", color: "#6366f1" }}>
                    {Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / applications.length)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* How to update status tip */}
          <div style={{ padding: "14px 18px", borderRadius: "10px", background: "var(--accent-dim)", border: "1px solid var(--border-strong)" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              💡 <strong style={{ color: "var(--text-primary)" }}>To increase Offer/Interview count:</strong> Expand any application below and click the <strong>"→ Interview"</strong> or <strong>"→ Offer"</strong> status buttons.
            </p>
          </div>

          {/* Applications list by status */}
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const group = grouped[status];
            if (!group?.length) return null;
            return (
              <section key={status}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "6px", height: "24px", borderRadius: "3px", background: cfg.color }} />
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: "700" }}>
                    {cfg.emoji} {cfg.label}
                    <span style={{ color: "var(--text-muted)", fontWeight: "400", marginLeft: "8px" }}>({group.length})</span>
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {group.map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      cfg={cfg}
                      expanded={expandedId === app.id}
                      onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Application Card ──────────────────────────────────────────────────────────
function AppCard({ app, cfg, expanded, onToggle, onStatusUpdate, onDelete }) {
  // Correct timestamp handling - covers all Firestore formats
  const getDate = (ts) => {
    if (!ts) return new Date();
    if (typeof ts.toDate === "function") return ts.toDate(); // Firestore Timestamp object
    if (ts._seconds) return new Date(ts._seconds * 1000); // Firestore serialized {_seconds, _nanoseconds}
    if (ts.seconds) return new Date(ts.seconds * 1000); // Firestore raw {seconds, nanoseconds}
    if (typeof ts === "string" || typeof ts === "number") return new Date(ts);
    return new Date();
  };

  const appliedDate = getDate(app.appliedAt);
  const formattedDate = appliedDate.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const formattedTime = appliedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const nextStatuses = STATUS_CONFIG[app.status]?.next || [];

  return (
    <div className="card" style={{ padding: "18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Company avatar */}
        <div style={{
          width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0,
          background: `hsl(${(app.company?.charCodeAt(0)||65)*7%360},40%,20%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "800", fontSize: "18px",
          color: `hsl(${(app.company?.charCodeAt(0)||65)*7%360},70%,70%)`,
        }}>
          {app.company?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + Status */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
            <div>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", marginBottom: "3px", color: "#ffffff" }}>
                {app.jobTitle}
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                🏢 {app.company}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {app.matchScore > 0 && (
                <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "13px", fontWeight: "700", color: cfg.color, background: `${cfg.color}18` }}>
                  {app.matchScore}%
                </span>
              )}
              <span style={{ padding: "5px 12px", borderRadius: "99px", fontSize: "13px", fontWeight: "700", background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                {cfg.emoji} {cfg.label}
              </span>
            </div>
          </div>

          {/* Correct timestamp */}
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            🕐 Applied: <strong style={{ color: "var(--text-secondary)" }}>{formattedDate} at {formattedTime}</strong>
          </p>

          {/* Status update buttons — always visible */}
          {nextStatuses.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>Move to:</p>
              {nextStatuses.map(nextStatus => (
                <button
                  key={nextStatus}
                  onClick={() => onStatusUpdate(app, nextStatus)}
                  style={{
                    padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: STATUS_CONFIG[nextStatus].color,
                    color: "#fff", fontSize: "13px", fontWeight: "600",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {STATUS_CONFIG[nextStatus].emoji} {STATUS_CONFIG[nextStatus].label}
                </button>
              ))}
            </div>
          )}

          {/* Secondary actions */}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "13px" }} onClick={onToggle}>
              {expanded ? "▲ Hide Timeline" : "▼ Timeline"}
            </button>
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: "13px" }}>
              View Job ↗
            </a>
            <button onClick={() => onDelete(app.id)} style={{
              marginLeft: "auto", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer",
              fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
            }}>
              Remove
            </button>
          </div>

          {/* Timeline */}
          {expanded && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                📅 Full Timeline
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(app.timeline || []).map((event, i) => {
                  const evtCfg = STATUS_CONFIG[event.status];
                  const evtDate = getDate(event.changedAt);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: evtCfg?.color || "#6b7280", boxShadow: `0 0 6px ${evtCfg?.color || "#6b7280"}60` }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {evtCfg?.emoji} {evtCfg?.label || event.status}
                        </p>
                        {event.note && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{event.note}</p>}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>
                        {evtDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} {evtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
