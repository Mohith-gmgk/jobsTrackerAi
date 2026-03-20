// api.js - 2 minute timeout for match scoring
import axios from "axios";
import { getIdToken } from "./firebase.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: 120000,
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export const fetchJobs = (params) => api.get("/api/jobs", { params });
export const matchJobs = (resumeText, jobs) =>
  api.post("/api/match", { resumeText, jobs }, { timeout: 120000 });
export const sendAssistantMessage = (message, conversationHistory, currentFilters) =>
  api.post("/api/assistant", { message, conversationHistory, currentFilters });
export const uploadResume = (formData) =>
  api.post("/api/resume", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getResumeInfo = () => api.get("/api/resume");
export const getApplications = () => api.get("/api/applications");
export const createApplication = (data) => api.post("/api/applications", data);
export const updateApplicationStatus = (id, status, note) =>
  api.patch(`/api/applications/${id}`, { status, note });
export const deleteApplication = (id) => api.delete(`/api/applications/${id}`);

export default api;

// ── Bonus Features ────────────────────────────────────────────────────────────
export const getResumeTips = (jobTitle, jobDescription, jobSkills) =>
  api.post("/api/resume-tips", { jobTitle, jobDescription, jobSkills });

export const generateCoverLetter = (jobTitle, company, jobDescription) =>
  api.post("/api/cover-letter", { jobTitle, company, jobDescription });
