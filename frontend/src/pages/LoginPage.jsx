// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../services/firebase.js";
import { toast } from "../utils/toast.js";

export default function LoginPage() {
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test@123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/onboarding");
    } catch (err) {
      toast.error("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      {/* Glow orb */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-fade-in" style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "26px",
            boxShadow: "0 0 30px rgba(99,102,241,0.4)",
          }}>⚡</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800" }}>
            Jobs<span style={{ color: "var(--accent)" }}>TrackerAI</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "14px" }}>
            AI-powered job tracking & smart matching
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Welcome back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "24px" }}>
            Sign in to continue to your job dashboard
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: "500" }}>
                Email
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@gmail.com"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: "500" }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="test@123"
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "8px", padding: "12px" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Test credentials hint */}
          <div style={{
            marginTop: "20px", padding: "12px", borderRadius: "8px",
            background: "var(--accent-dim)", border: "1px solid var(--border-strong)",
          }}>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "center" }}>
              Test credentials pre-filled: <strong style={{ color: "var(--accent)" }}>test@gmail.com</strong> / <strong style={{ color: "var(--accent)" }}>test@123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
