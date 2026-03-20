// frontend/src/components/JobCard/JobCardSkeleton.jsx
export default function JobCardSkeleton() {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease infinite" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ height: "16px", width: "60%", borderRadius: "4px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease infinite" }} />
          <div style={{ height: "12px", width: "40%", borderRadius: "4px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease infinite 0.1s" }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: "24px", width: "64px", borderRadius: "99px", background: "var(--bg-elevated)", animation: `pulse 1.5s ease infinite ${i * 0.1}s` }} />
            ))}
          </div>
          <div style={{ height: "32px", width: "80px", borderRadius: "8px", background: "var(--bg-elevated)", animation: "pulse 1.5s ease infinite 0.3s" }} />
        </div>
      </div>
    </div>
  );
}
