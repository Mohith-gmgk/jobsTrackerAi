// main.jsx - Remove StrictMode to prevent double renders during development
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode removed — was causing double API calls and scoring conflicts
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
