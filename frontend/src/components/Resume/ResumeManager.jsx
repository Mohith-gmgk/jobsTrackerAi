// frontend/src/components/Resume/ResumeManager.jsx
// Allows user to view and replace their resume from within the main app
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useStore } from "../../store/index.js";
import { uploadResume, getResumeInfo } from "../../services/api.js";
import { toast } from "../../utils/toast.js";

export default function ResumeManager({ onClose }) {
  const { resumeInfo, setResumeInfo, setResumeText } = useStore();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadResume(formData);
      // Re-fetch full info including resumeText
      const info = await getResumeInfo();
      setResumeInfo(info);
      if (info?.resumeText) setResumeText(info.resumeText);
      setUploaded(true);
      toast.success("✅ Resume updated! Jobs will re-score with your new resume.");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }, [setResumeInfo, setResumeText]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    disabled: uploading,
  });

  const updatedAt = resumeInfo?.resumeUpdatedAt
    ? new Date(resumeInfo.resumeUpdatedAt._seconds * 1000).toLocaleDateString()
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div className="animate-slide-up card" style={{ width: "100%", maxWidth: "440px", padding: "28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: "700" }}>📄 Resume</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
              Upload or replace your resume for AI matching
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        {/* Current resume status */}
        {resumeInfo?.hasResume && !uploaded && (
          <div style={{
            padding: "12px 14px", borderRadius: "8px",
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            marginBottom: "16px",
          }}>
            <p style={{ fontSize: "13px", color: "#10b981", fontWeight: "500" }}>✅ Resume active</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {updatedAt ? `Last updated ${updatedAt}` : "Uploaded"} · {resumeInfo.textLength?.toLocaleString()} characters extracted
            </p>
          </div>
        )}

        {uploaded && (
          <div style={{
            padding: "12px 14px", borderRadius: "8px",
            background: "rgba(99,102,241,0.08)", border: "1px solid var(--border-strong)",
            marginBottom: "16px",
          }}>
            <p style={{ fontSize: "13px", color: "var(--accent)", fontWeight: "500" }}>🎉 Resume updated!</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              Jobs will be re-scored with your new resume on next load.
            </p>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius)",
            padding: "36px 24px",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: isDragActive ? "var(--accent-dim)" : "var(--bg-elevated)",
            transition: "all 0.2s ease",
          }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div className="loading-spinner" />
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Uploading & extracting text...</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{isDragActive ? "📂" : "📁"}</div>
              <p style={{ color: "var(--text-primary)", fontWeight: "500", fontSize: "14px", marginBottom: "4px" }}>
                {resumeInfo?.hasResume ? "Drop new resume to replace" : "Drop your resume here"}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                or <span style={{ color: "var(--accent)" }}>click to browse</span> · PDF or TXT · Max 5MB
              </p>
            </>
          )}
        </div>

        <button onClick={onClose} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: "14px", fontSize: "13px" }}>
          {uploaded ? "Done" : "Close"}
        </button>
      </div>
    </div>
  );
}
