// store/index.js - Added theme support
import { create } from "zustand";

const DEFAULT_FILTERS = {
  role: "", skills: [], datePosted: "any",
  jobType: "", workMode: "", location: "", matchScore: "all",
};

export const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: null,
  authReady: false,
  setUser: (user) => set({ user, authReady: true }),

  // ── Theme ─────────────────────────────────────────────────────────────────
  theme: "dark",
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    set({ theme: newTheme });
  },

  // ── Resume ────────────────────────────────────────────────────────────────
  resumeText: null,
  resumeInfo: null,
  setResumeText: (resumeText) => set({ resumeText }),
  setResumeInfo: (resumeInfo) => set({ resumeInfo }),

  // ── Jobs ──────────────────────────────────────────────────────────────────
  jobs: [],
  jobsLoading: false,
  jobsError: null,
  setJobs: (jobs) => set({ jobs }),
  setJobsLoading: (jobsLoading) => set({ jobsLoading }),
  setJobsError: (jobsError) => set({ jobsError }),

  // ── Filters ───────────────────────────────────────────────────────────────
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  applyFilterActions: (payload) => {
    if (payload.clearAll) { set({ filters: { ...DEFAULT_FILTERS } }); return; }
    set((state) => ({
      filters: {
        ...state.filters,
        ...(payload.role !== undefined && { role: payload.role }),
        ...(payload.skills !== undefined && { skills: payload.skills }),
        ...(payload.datePosted !== undefined && { datePosted: payload.datePosted }),
        ...(payload.jobType !== undefined && { jobType: payload.jobType }),
        ...(payload.workMode !== undefined && { workMode: payload.workMode }),
        ...(payload.location !== undefined && { location: payload.location }),
        ...(payload.matchScore !== undefined && { matchScore: payload.matchScore }),
      },
    }));
  },
  clearFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  // ── Apply Popup ───────────────────────────────────────────────────────────
  applyPopup: null,
  setApplyPopup: (applyPopup) => set({ applyPopup }),
  clearApplyPopup: () => set({ applyPopup: null }),

  // ── Applications ──────────────────────────────────────────────────────────
  applications: [],
  setApplications: (applications) => set({ applications }),
  addApplication: (app) => set((state) => ({ applications: [app, ...state.applications] })),
  updateApplication: (id, updates) => set((state) => ({
    applications: state.applications.map((a) => a.id === id ? { ...a, ...updates } : a),
  })),
  removeApplication: (id) => set((state) => ({
    applications: state.applications.filter((a) => a.id !== id),
  })),

  // ── AI Chat ───────────────────────────────────────────────────────────────
  chatOpen: false,
  chatMessages: [],
  chatLoading: false,
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, { ...message, timestamp: new Date() }],
  })),
  setChatLoading: (chatLoading) => set({ chatLoading }),

  // ── UI ────────────────────────────────────────────────────────────────────
  activeTab: "feed",
  setActiveTab: (activeTab) => set({ activeTab }),
}));

export const useFilters = () => useStore((s) => s.filters);
export const useJobs = () => useStore((s) => ({ jobs: s.jobs, loading: s.jobsLoading, error: s.jobsError }));
export const useUser = () => useStore((s) => s.user);
export const useChat = () => useStore((s) => ({
  open: s.chatOpen, messages: s.chatMessages,
  loading: s.chatLoading, toggle: s.toggleChat,
}));
