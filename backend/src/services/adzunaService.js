// backend/src/services/adzunaService.js
const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

const SKILL_KEYWORDS = [
  "React","Node.js","Python","TypeScript","JavaScript","Java","Go","Rust",
  "AWS","GCP","Azure","Docker","Kubernetes","GraphQL","PostgreSQL","MongoDB",
  "Redis","LangChain","LangGraph","TensorFlow","PyTorch","FastAPI","Next.js",
  "Vue","Angular","SQL","Git","CI/CD","Terraform","Kafka","Spark"
];

function extractSkills(text = "") {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter((s) => lower.includes(s.toLowerCase()));
}

function inferWorkMode(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("remote")) return "remote";
  if (lower.includes("hybrid")) return "hybrid";
  return "on-site";
}

function normalizeJob(raw) {
  return {
    id: raw.id,
    title: raw.title || "Untitled Role",
    company: raw.company?.display_name || "Unknown Company",
    location: raw.location?.display_name || "Unknown Location",
    description: raw.description || "",
    jobType: raw.contract_time === "part_time" ? "part-time" : "full-time",
    workMode: inferWorkMode((raw.description || "") + " " + (raw.title || "")),
    skills: extractSkills(raw.description || ""),
    applyUrl: raw.redirect_url,
    postedAt: raw.created,
    salary: raw.salary_min && raw.salary_max
      ? `${Math.round(raw.salary_min / 1000)}k – ${Math.round(raw.salary_max / 1000)}k`
      : null,
    matchScore: 0,
    matchExplanation: null,
  };
}

export async function fetchJobs({ role = "software developer", location = "", page = 1, results = 20 } = {}) {
  const country = process.env.ADZUNA_COUNTRY || "us";

  // Build params — DO NOT include page here, it goes in the URL path only
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page: String(results),
    what: role || "software developer",
  });

  // Only add where if location is provided
  if (location && location.trim()) {
    params.append("where", location.trim());
  }

  // page goes in the PATH not in query params
  const url = `${ADZUNA_BASE}/${country}/search/${page}?${params.toString()}`;

  console.log("Fetching Adzuna:", url); // debug log

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    console.error("Adzuna error body:", body);
    throw new Error(`Adzuna API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    jobs: (data.results || []).map(normalizeJob),
    total: data.count || 0,
    page,
  };
}
