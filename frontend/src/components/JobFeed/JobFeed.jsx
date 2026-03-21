// JobFeed.jsx - Mobile responsive
import { useStore, useFilters } from "../../store/index.js";
import { applyClientFilters, getBestMatches } from "../../utils/scoring.js";
import JobCard from "../JobCard/JobCard.jsx";
import JobCardSkeleton from "../JobCard/JobCardSkeleton.jsx";

export default function JobFeed({ isMobile, onFilterClick }) {
  const { jobs, jobsLoading, jobsError, resumeInfo } = useStore();
  const filters = useFilters();

  const filteredJobs = applyClientFilters(jobs, filters);
  const bestMatches = resumeInfo?.hasResume ? getBestMatches(filteredJobs) : [];
  const otherJobs = bestMatches.length > 0
    ? filteredJobs.filter(j => !bestMatches.find(b => b.id === j.id))
    : filteredJobs;

  if (jobsError) return (
    <div className="card" style={{ padding: "40px", textAlign: "center" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
      <h3 style={{ marginBottom: "8px" }}>Failed to load jobs</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{jobsError}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "18px" : "22px", fontWeight: "800" }}>
          {jobsLoading ? "Finding jobs..." : `${filteredJobs.length} Jobs Found`}
        </h2>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {resumeInfo?.hasResume && !jobsLoading && (
            <span className="badge" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--border-strong)", fontSize: "11px" }}>
              ⚡ AI Matching Active
            </span>
          )}
          {!resumeInfo?.hasResume && (
            <span className="badge" style={{ background: "rgba(107,114,128,0.1)", color: "var(--text-muted)", fontSize: "11px" }}>
              Upload resume for match scores
            </span>
          )}
        </div>

        {/* Mobile filter button in feed */}
        {isMobile && (
          <button onClick={onFilterClick} style={{
            marginLeft: "auto", padding: "6px 14px", borderRadius: "8px",
            background: "var(--accent-dim)", border: "1px solid var(--border-strong)",
            color: "var(--accent)", cursor: "pointer", fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif", fontWeight: "600",
          }}>
            ☰ Filters
          </button>
        )}
      </div>

      {/* Loading note */}
      {jobsLoading && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "var(--accent-dim)", border: "1px solid var(--border-strong)" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ⏳ <strong>Please wait 10-15 seconds</strong> — fetching jobs from Adzuna and scoring each one with AI...
          </p>
        </div>
      )}

      {/* Best Matches */}
      {bestMatches.length > 0 && !jobsLoading && (
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "6px", height: "24px", borderRadius: "3px", background: "linear-gradient(to bottom, #10b981, #6366f1)" }} />
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "14px" : "16px", fontWeight: "700" }}>
              ⭐ Best Matches
            </h3>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Top {bestMatches.length} picks</span>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {bestMatches.map((job, i) => <JobCard key={job.id} job={job} index={i} highlight isMobile={isMobile} />)}
          </div>
        </section>
      )}

      {/* All Jobs */}
      <section>
        {bestMatches.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "6px", height: "24px", borderRadius: "3px", background: "var(--border-strong)" }} />
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? "14px" : "16px", fontWeight: "700" }}>All Jobs</h3>
          </div>
        )}
        <div style={{ display: "grid", gap: "10px" }}>
          {jobsLoading
            ? Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
            : otherJobs.length > 0
            ? otherJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} isMobile={isMobile} />)
            : (
              <div className="card" style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
                <h3 style={{ marginBottom: "8px" }}>No jobs match your filters</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Try adjusting filters or ask the AI assistant.</p>
              </div>
            )
          }
        </div>
      </section>
    </div>
  );
}
