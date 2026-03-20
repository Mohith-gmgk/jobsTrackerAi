// FilterPanel.jsx - More skills, bigger fonts, smooth scrolling
import { useState, useEffect } from "react";
import { useStore, useFilters } from "../../store/index.js";

const SKILLS_OPTIONS = [
  // Frontend
  "React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind",
  // Backend
  "Node.js", "Python", "Java", "Go", "Rust", "PHP", "Ruby", "C#", "C++", "FastAPI", "Django", "Spring Boot",
  // AI/ML
  "TensorFlow", "PyTorch", "LangChain", "LangGraph", "OpenAI", "Scikit-learn", "Pandas", "NumPy",
  // Cloud & DevOps
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions",
  // Databases
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "Supabase", "GraphQL", "SQL",
  // Other
  "Git", "Linux", "Agile", "Scrum", "Kafka", "Spark", "Elasticsearch",
];

export default function FilterPanel() {
  const filters = useFilters();
  const { setFilter, clearFilters } = useStore();
  const [roleInput, setRoleInput] = useState(filters.role || "");
  const [locationInput, setLocationInput] = useState(filters.location || "");

  useEffect(() => { setRoleInput(filters.role || ""); }, [filters.role]);
  useEffect(() => { setLocationInput(filters.location || ""); }, [filters.location]);

  useEffect(() => {
    const t = setTimeout(() => setFilter("role", roleInput), 600);
    return () => clearTimeout(t);
  }, [roleInput]);

  useEffect(() => {
    const t = setTimeout(() => setFilter("location", locationInput), 600);
    return () => clearTimeout(t);
  }, [locationInput]);

  const toggleSkill = (skill) => {
    const current = filters.skills || [];
    const updated = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
    setFilter("skills", updated);
  };

  const hasActiveFilters = filters.role || filters.skills?.length || filters.datePosted !== "any"
    || filters.jobType || filters.workMode || filters.location || filters.matchScore !== "all";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "12px",
      position: "sticky", top: "calc(var(--header-height) + 24px)",
      maxHeight: "calc(100vh - var(--header-height) - 48px)",
      overflowY: "auto", overflowX: "hidden",
      paddingRight: "4px", scrollBehavior: "smooth",
      // Smooth scrolling fix
      WebkitOverflowScrolling: "touch",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "4px" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "0.5px" }}>
          🔧 Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}>
            Clear all
          </button>
        )}
      </div>

      {/* Role */}
      <FilterSection label="Role / Title">
        <input className="input" placeholder="e.g. React Developer" value={roleInput} onChange={e => setRoleInput(e.target.value)} />
      </FilterSection>

      {/* Location */}
      <FilterSection label="Location">
        <input className="input" placeholder="City or region" value={locationInput} onChange={e => setLocationInput(e.target.value)} />
      </FilterSection>

      {/* Skills - expanded list */}
      <FilterSection label={`Skills ${filters.skills?.length ? `(${filters.skills.length})` : ""}`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SKILLS_OPTIONS.map(skill => (
            <button
              key={skill}
              className={`chip ${filters.skills?.includes(skill) ? "active" : ""}`}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Date Posted */}
      <FilterSection label="Date Posted">
        <select className="input" value={filters.datePosted} onChange={e => setFilter("datePosted", e.target.value)}>
          <option value="any">Any time</option>
          <option value="24h">Last 24 hours</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
        </select>
      </FilterSection>

      {/* Job Type */}
      <FilterSection label="Job Type">
        <select className="input" value={filters.jobType} onChange={e => setFilter("jobType", e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection label="Work Mode">
        <div style={{ display: "flex", gap: "6px" }}>
          {["remote", "hybrid", "on-site"].map(mode => (
            <button
              key={mode}
              className={`chip ${filters.workMode === mode ? "active" : ""}`}
              style={{ flex: 1, justifyContent: "center", fontSize: "12px" }}
              onClick={() => setFilter("workMode", filters.workMode === mode ? "" : mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Match Score */}
      <FilterSection label="Match Score">
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { value: "all", label: "⚪ All", color: "var(--score-low)" },
            { value: "high", label: "🟢 High >70%", color: "var(--score-high)" },
            { value: "medium", label: "🟡 40-70%", color: "var(--score-medium)" },
          ].map(opt => (
            <button
              key={opt.value}
              className={`chip ${filters.matchScore === opt.value ? "active" : ""}`}
              style={{ fontSize: "12px" }}
              onClick={() => setFilter("matchScore", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Bottom padding */}
      <div style={{ height: "20px" }} />
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <p className="filter-label">{label}</p>
      {children}
    </div>
  );
}
