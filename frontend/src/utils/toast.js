// frontend/src/utils/toast.js
// Lightweight toast system — no external dependency needed

const createToast = (message, type = "info", duration = 3500) => {
  const existing = document.getElementById("toast-container");
  const container = existing || (() => {
    const el = document.createElement("div");
    el.id = "toast-container";
    el.style.cssText = `
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px; pointer-events: none;
    `;
    document.body.appendChild(el);
    return el;
  })();

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#6366f1",
    warning: "#f59e0b",
  };

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: #1e1e2e; color: #cdd6f4; border-left: 3px solid ${colors[type] || colors.info};
    padding: 12px 16px; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4); max-width: 320px; pointer-events: all;
    animation: slideIn 0.3s ease; opacity: 1; transition: opacity 0.3s ease;
  `;
  toast.textContent = message;

  if (!document.getElementById("toast-styles")) {
    const style = document.createElement("style");
    style.id = "toast-styles";
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

export const toast = {
  success: (msg) => createToast(msg, "success"),
  error: (msg) => createToast(msg, "error"),
  info: (msg) => createToast(msg, "info"),
  warning: (msg) => createToast(msg, "warning"),
};
