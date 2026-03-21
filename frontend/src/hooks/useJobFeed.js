// useJobFeed.js - Shows jobs instantly, scores in background
import { useEffect, useCallback, useRef } from "react";
import { fetchJobs, matchJobs } from "../services/api.js";
import { useStore, useFilters } from "../store/index.js";

export function useJobFeed() {
  const filters = useFilters();
  const { setJobs, setJobsLoading, setJobsError, resumeText } = useStore();
  const resumeTextRef = useRef(resumeText);
  const isScoringRef = useRef(false);

  useEffect(() => { resumeTextRef.current = resumeText; }, [resumeText]);

  const loadJobs = useCallback(async () => {
    if (isScoringRef.current) return;
    isScoringRef.current = true;
    setJobsLoading(true);
    setJobsError(null);

    try {
      const data = await fetchJobs({
        role: filters.role || "software developer",
        location: filters.location || "",
        results: 20,
      });

      let jobs = data.jobs || [];
      console.log(`📡 ${jobs.length} jobs fetched`);

      // ── STEP 1: Show jobs immediately without scores ──────────────────────
      setJobs([...jobs]);
      setJobsLoading(false); // Stop loading spinner — jobs visible now!

      // ── STEP 2: Score in background (non-blocking) ────────────────────────
      const currentResumeText = resumeTextRef.current;
      if (currentResumeText && currentResumeText.length > 50) {
        console.log("🎯 Scoring in background...");
        try {
          const matchData = await matchJobs(
            currentResumeText,
            jobs.map(j => ({ id: j.id, title: j.title, description: j.description || "", skills: j.skills || [] }))
          );

          const matches = matchData?.matches || [];
          if (matches.length > 0) {
            const scoreById = {};
            matches.forEach((m, idx) => {
              if (m.jobId) scoreById[m.jobId] = m;
              scoreById[`idx_${idx}`] = m;
            });

            // Update jobs with scores
            const scoredJobs = jobs.map((j, idx) => {
              const match = scoreById[j.id] || scoreById[`idx_${idx}`];
              return {
                ...j,
                matchScore: Number(match?.score) || 0,
                matchExplanation: match?.explanation || null,
              };
            });

            console.log("✅ Scores applied:", scoredJobs.filter(j => j.matchScore > 0).length, "jobs scored");
            setJobs([...scoredJobs]); // Update with scores
          }
        } catch (err) {
          console.error("❌ Scoring error:", err.message);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setJobsError(err.message);
        setJobsLoading(false);
      }
    } finally {
      isScoringRef.current = false;
    }
  }, [filters.role, filters.location]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  return { reload: loadJobs };
}
