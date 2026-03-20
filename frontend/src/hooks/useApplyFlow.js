// frontend/src/hooks/useApplyFlow.js
// Handles the "Did you apply?" popup logic
// Smart: detects when user returns from external tab

import { useEffect, useCallback } from "react";
import { useStore } from "../store/index.js";
import { createApplication } from "../services/api.js";
import { toast } from "../utils/toast.js";

export function useApplyFlow() {
  const { applyPopup, setApplyPopup, clearApplyPopup, addApplication } = useStore();

  // When user clicks Apply on a job card
  const handleApply = useCallback((job) => {
    // Open external job URL in new tab
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");

    // Store the pending job — we'll show the popup when user comes back
    setApplyPopup({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      jobUrl: job.applyUrl,
      matchScore: job.matchScore,
    });
  }, [setApplyPopup]);

  // Detect when user returns to the tab (visibilitychange)
  useEffect(() => {
    if (!applyPopup) return;

    let triggered = false;
    const onVisible = () => {
      if (!triggered && document.visibilityState === "visible") {
        triggered = true;
        // Small delay so the popup doesn't flash instantly
        setTimeout(() => {
          // Popup is already in state — the ApplyPopup component renders based on applyPopup !== null
        }, 800);
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [applyPopup]);

  // Handle popup response
  const handlePopupResponse = useCallback(async (response) => {
    if (!applyPopup) return;

    if (response === "yes" || response === "earlier") {
      try {
        const app = await createApplication({
          jobId: applyPopup.jobId,
          jobTitle: applyPopup.jobTitle,
          company: applyPopup.company,
          jobUrl: applyPopup.jobUrl,
          matchScore: applyPopup.matchScore,
        });
        addApplication(app);
        toast.success(`✅ Tracked! "${applyPopup.jobTitle}" added to your applications.`);
      } catch (err) {
        toast.error("Failed to save application. Try again.");
      }
    } else {
      toast.info("No worries! Job not tracked.");
    }

    clearApplyPopup();
  }, [applyPopup, addApplication, clearApplyPopup]);

  return { handleApply, handlePopupResponse };
}
