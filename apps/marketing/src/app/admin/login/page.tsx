"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";

export default function AdminLogin() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Default superAdmin — accepts username OR email
    // In production, this will validate via POST /api/auth/login
    const SUPER_ADMIN = {
      username: "OrbisAdmin",
      email: "admin@orbisoutreach.com",
      password: "Orbis@8214@@!!",
    };

    setTimeout(() => {
      const inputLower = identity.trim().toLowerCase();
      const matchesUsername = inputLower === SUPER_ADMIN.username.toLowerCase();
      const matchesEmail = inputLower === SUPER_ADMIN.email.toLowerCase();

      if (
        (matchesUsername || matchesEmail) &&
        password === SUPER_ADMIN.password
      ) {
        localStorage.setItem(
          "orbis_auth",
          JSON.stringify({
            user: SUPER_ADMIN.username,
            role: "superAdmin",
            loginAt: new Date().toISOString(),
          }),
        );
        window.location.href = "http://localhost:3000";
      } else {
        setError("Invalid username/email or password");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div
            className="nav-logo-icon"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            ◉
          </div>
          Orbis Outreach - BPS
        </div>
        <p className="login-subtitle">Sign in to the admin dashboard</p>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "0.85rem",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identity">Username or Email</label>
            <input
              id="identity"
              type="text"
              placeholder="OrbisAdmin or admin@orbisoutreach.com"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-row">
            <label className="form-checkbox">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="form-link">
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: "wait" } : {}}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <Link href="/" className="login-back">
          ← Back to Orbis Outreach - BPS
        </Link>
      </div>
    </div>
  );
}
