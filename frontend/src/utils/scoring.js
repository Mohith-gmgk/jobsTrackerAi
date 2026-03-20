// scoring.js - All 3 score levels including gray
export function getScoreBadge(score) {
  if (score >= 70) return { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "High Match", emoji: "🟢" };
  if (score >= 40) return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Medium Match", emoji: "🟡" };
  // Gray always shows even for 0 score
  return { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: "Low Match", emoji: "⚪" };
}

export function applyClientFilters(jobs, filters) {
  return jobs.filter(job => {
    if (filters.skills?.length > 0) {
      const hasSkill = filters.skills.some(skill =>
        job.skills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasSkill) return false;
    }
    if (filters.jobType && job.jobType !== filters.jobType) return false;
    if (filters.workMode && job.workMode !== filters.workMode) return false;
    if (filters.datePosted && filters.datePosted !== "any") {
      const diffDays = (Date.now() - new Date(job.postedAt)) / 86400000;
      if (filters.datePosted === "24h" && diffDays > 1) return false;
      if (filters.datePosted === "week" && diffDays > 7) return false;
      if (filters.datePosted === "month" && diffDays > 30) return false;
    }
    if (filters.matchScore === "high" && job.matchScore < 70) return false;
    if (filters.matchScore === "medium" && (job.matchScore < 40 || job.matchScore >= 70)) return false;
    return true;
  });
}

export function getBestMatches(jobs, count = 8) {
  return [...jobs].filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, count);
}
