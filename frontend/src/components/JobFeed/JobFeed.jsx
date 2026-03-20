// frontend/src/components/JobFeed/JobFeed.jsx
import { useStore, useFilters } from "../../store/index.js";
import { applyClientFilters, getBestMatches } from "../../utils/scoring.js";
import JobCard from "../JobCard/JobCard.jsx";
import JobCardSkeleton from "../JobCard/JobCardSkeleton.jsx";

export default function JobFeed() {
  const { jobs, jobsLoading, jobsError, resumeInfo } = useStore();
  const filters = useFilters();

  const filteredJobs = applyClientFilters(jobs, filters);
  const bestMatches = resumeInfo?.hasResume ? getBestMatches(filteredJobs) : [];
  const otherJobs = bestMatches.length > 0
    ? filteredJobs.filter((j) => !bestMatches.find((b) => b.id === j.id))
    : filteredJobs;

  if (jobsError) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
        <h3 style={{ marginBottom: "8px" }}>Failed to load jobs</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{jobsError}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Stats bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: "800" }}>
          {jobsLoading ? "Finding jobs..." : `${filteredJobs.length} Jobs Found`}
        </h2>
        {resumeInfo?.hasResume && !jobsLoading && (
          <span className="badge" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--border-strong)" }}>
            ⚡ AI Matching Active
          </span>
        )}
        {!resumeInfo?.hasResume && (
          <span className="badge" style={{ background: "rgba(107,114,128,0.1)", color: "var(--text-muted)" }}>
            Upload resume for match scores
          </span>
        )}
      </div>

      {/* Best Matches Section */}
      {bestMatches.length > 0 && !jobsLoading && (
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "6px", height: "24px", borderRadius: "3px",
              background: "linear-gradient(to bottom, #10b981, #6366f1)",
            }} />
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700" }}>
              ⭐ Best Matches
            </h3>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Top {bestMatches.length} picks for you
            </span>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {bestMatches.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} highlight />
            ))}
          </div>
        </section>
      )}

      {/* All Jobs */}
      <section>
        {bestMatches.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "6px", height: "24px", borderRadius: "3px", background: "var(--border-strong)" }} />
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700" }}>
              All Jobs
            </h3>
          </div>
        )}

        <div style={{ display: "grid", gap: "12px" }}>
          {jobsLoading
            ? Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            : otherJobs.length > 0
            ? otherJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
            : (
              <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
                <h3 style={{ marginBottom: "8px" }}>No jobs match your filters</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  Try adjusting your filters or ask the AI assistant for help.
                </p>
              </div>
            )
          }
        </div>
      </section>
    </div>
  );
}
