// frontend/src/pages/OnboardingPage.jsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useStore } from "../store/index.js";
import { uploadResume, getResumeInfo } from "../services/api.js";
import { toast } from "../utils/toast.js";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setResumeInfo, setResumeText, user } = useStore();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [existingResume, setExistingResume] = useState(null);
  const [checkingResume, setCheckingResume] = useState(true);

  // FIX 8: Check if user already has a resume — skip onboarding if so
  useEffect(() => {
    if (user) {
      getResumeInfo()
        .then((info) => {
          if (info?.hasResume) {
            setExistingResume(info);
            setResumeInfo(info);
            if (info.resumeText) setResumeText(info.resumeText);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingResume(false));
    }
  }, [user, setResumeInfo, setResumeText]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadResume(formData);
      // Re-fetch to get resumeText
      const info = await getResumeInfo();
      setResumeInfo(info);
      if (info?.resumeText) setResumeText(info.resumeText);
      setUploaded(true);
      setExistingResume(null);
      toast.success("Resume uploaded successfully!");
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

  const handleSkip = () => navigate("/");
  const handleContinue = () => navigate("/");

  if (checkingResume) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div className="animate-fade-in" style={{ width: "100%", maxWidth: "500px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "26px", fontWeight: "800" }}>
            Upload your resume
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "14px", lineHeight: "1.6" }}>
            JobAI uses your resume to score every job listing.<br />
            You'll see a <strong style={{ color: "var(--score-high)" }}>match % on each card</strong>.
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          {/* Existing resume detected */}
          {existingResume && !uploaded && (
            <div style={{ marginBottom: "20px", padding: "14px", borderRadius: "8px", background: "var(--accent-dim)", border: "1px solid var(--border-strong)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                ✅ <strong style={{ color: "var(--text-primary)" }}>You already have a resume uploaded.</strong>
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Last updated: {existingResume.resumeUpdatedAt ? new Date(existingResume.resumeUpdatedAt._seconds * 1000).toLocaleDateString() : "Previously"} · {existingResume.textLength} characters extracted
              </p>
              <button onClick={handleContinue} className="btn btn-primary" style={{ marginTop: "10px", padding: "8px 16px", fontSize: "13px" }}>
                Continue to Job Feed →
              </button>
            </div>
          )}
          {!uploaded ? (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  padding: "48px 24px",
                  textAlign: "center",
                  cursor: uploading ? "not-allowed" : "pointer",
                  background: isDragActive ? "var(--accent-dim)" : "var(--bg-elevated)",
                  transition: "all 0.2s ease",
                }}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div className="loading-spinner" />
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Uploading & extracting text...</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                      {isDragActive ? "📂" : "📁"}
                    </div>
                    <p style={{ color: "var(--text-primary)", fontWeight: "500", marginBottom: "4px" }}>
                      {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>click to browse</span>
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "12px" }}>
                      PDF or TXT · Max 5MB
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={handleSkip}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center", marginTop: "16px", fontSize: "13px" }}
              >
                Skip for now (no matching scores)
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", marginBottom: "8px" }}>
                Resume uploaded!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                Job matching is now active. Every listing will show your compatibility score.
              </p>
              <button onClick={handleContinue} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                Go to Job Feed →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
