// useFollowUpNotifications.js - Smart reminders for applications
import { useEffect } from "react";
import { useStore } from "../store/index.js";
import { toast } from "../utils/toast.js";

export function useFollowUpNotifications() {
  const { applications } = useStore();

  useEffect(() => {
    if (!applications.length) return;

    const now = new Date();

    applications.forEach((app) => {
      if (app.status !== "applied") return;

      const appliedDate = app.appliedAt?.toDate
        ? app.appliedAt.toDate()
        : new Date(app.appliedAt);

      const daysSince = Math.floor((now - appliedDate) / (1000 * 60 * 60 * 24));

      // Notify if applied 3, 7, or 14 days ago with no update
      if (daysSince === 3) {
        setTimeout(() => {
          toast.info(`📬 Follow up on "${app.jobTitle}" at ${app.company} — applied ${daysSince} days ago!`);
        }, 2000);
      } else if (daysSince === 7) {
        setTimeout(() => {
          toast.warning(`⏰ "${app.jobTitle}" at ${app.company} — no response in a week. Consider following up!`);
        }, 3000);
      } else if (daysSince >= 14) {
        setTimeout(() => {
          toast.info(`💡 "${app.jobTitle}" at ${app.company} — ${daysSince} days old. Time to move on or reapply?`);
        }, 4000);
      }
    });
  }, [applications]);
}
