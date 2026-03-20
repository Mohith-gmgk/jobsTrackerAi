// frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/index.js";
import { onAuthChange } from "./services/firebase.js";
import LoginPage from "./pages/LoginPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

export default function App() {
  const { user, setUser, authReady } = useStore();

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser); // null = logged out, User object = logged in
    });
    return unsub;
  }, [setUser]);

  // Show spinner until Firebase resolves auth state (first onAuthChange call)
  if (!authReady) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/*"
        element={user ? <MainPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
