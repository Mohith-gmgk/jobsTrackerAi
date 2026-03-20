// useJobFeed.js - Final clean version with scoring lock
import { useEffect, useCallback, useRef } from "react";
import { fetchJobs, matchJobs } from "../services/api.js";
import { useStore, useFilters } from "../store/index.js";

export function useJobFeed() {
  const filters = useFilters();
  const { setJobs, setJobsLoading, setJobsError, resumeText } = useStore();
  const resumeTextRef = useRef(resumeText);
  const isScoringRef = useRef(false); // Lock to prevent concurrent scoring

  // Keep ref updated
  useEffect(() => {
    resumeTextRef.current = resumeText;
  }, [resumeText]);

  const loadJobs = useCallback(async () => {
    // Prevent concurrent scoring runs
    if (isScoringRef.current) {
      console.log("⏳ Scoring already in progress, skipping...");
      return;
    }

    setJobsLoading(true);
    setJobsError(null);
    isScoringRef.current = true;

    try {
      const data = await fetchJobs({
        role: filters.role || "software developer",
        location: filters.location || "",
        results: 20,
      });

      let jobs = data.jobs || [];
      const currentResumeText = resumeTextRef.current;
      console.log(`📡 ${jobs.length} jobs fetched | resume: ${currentResumeText?.length || 0} chars`);

      if (currentResumeText && currentResumeText.length > 50) {
        console.log("🎯 Scoring jobs...");
        try {
          const matchData = await matchJobs(
            currentResumeText,
            jobs.map(j => ({ id: j.id, title: j.title, description: j.description || "", skills: j.skills || [] }))
          );

          const matches = matchData?.matches || [];
          console.log(`✅ Got ${matches.length} scores`);

          if (matches.length > 0) {
            const scoreById = {};
            matches.forEach((m, idx) => {
              if (m.jobId) scoreById[m.jobId] = m;
              scoreById[`idx_${idx}`] = m;
            });

            jobs = jobs.map((j, idx) => {
              const match = scoreById[j.id] || scoreById[`idx_${idx}`];
              return {
                ...j,
                matchScore: Number(match?.score) || 0,
                matchExplanation: match?.explanation || null,
              };
            });

            console.log("✅ Scores:", jobs.slice(0,5).map(j => `${j.matchScore}%`).join(", "));
          }
        } catch (err) {
          console.error("❌ Scoring error:", err.message);
        }
      }

      setJobs([...jobs]);
    } catch (err) {
      if (err.name !== "AbortError") {
        setJobsError(err.message);
      }
    } finally {
      setJobsLoading(false);
      isScoringRef.current = false; // Release lock
    }
  }, [filters.role, filters.location]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return { reload: loadJobs };
}
