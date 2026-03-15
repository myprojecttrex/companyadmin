import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Navigation, Route, BarChart3, Loader2 } from "lucide-react";
import "./App.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    // Mimic slight network delay for better UX
    setTimeout(async () => {
      const success = await onLogin(form.username, form.password);
      if (!success) setError("Invalid username or password. Try the valid accounts.");
      setLoading(false);
    }, 800);
  };

  const quickFill = (username, pw) => setForm({ username, password: pw });

  const demoAccounts = [
    {
      role: "Main Admin",
      username: "admin1",
      pw: "pass123",
      letter: "M",
      color: "#e0e7ff",
      textColor: "#4f46e5",
    },
    {
      role: "Company Admin",
      username: "companyadmin",
      pw: "admin123",
      letter: "C",
      color: "#d1fae5",
      textColor: "#059669",
    },
  ];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT SIDE - BUS BANNER */}
      <div 
        style={{ 
          flex: 1.2, 
          position: "relative",
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px"
        }}
      >
        <div style={{ maxWidth: 450 }}>
          {/* Logo Badge */}
          <div style={{ 
            width: "56px", 
            height: "56px", 
            background: "rgba(255, 255, 255, 0.1)", 
            borderRadius: "14px", 
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: 800,
            marginBottom: "30px",
            backdropFilter: "blur(10px)"
          }}>
            GB
          </div>

          <h1 style={{ fontSize: "48px", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px" }}>
            GoBus Admin
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", lineHeight: "1.6", marginBottom: "40px" }}>
            Smart Real-Time Bus Tracking System — Monitor your fleet live, manage drivers, and trips.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(255,255,255,0.9)", fontSize: "15px" }}>
              <Navigation size={20} color="rgba(255,255,255,0.7)" />
              Live GPS tracking via driver mobile
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(255,255,255,0.9)", fontSize: "15px" }}>
              <Route size={20} color="rgba(255,255,255,0.7)" />
              Route & trip management
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "rgba(255,255,255,0.9)", fontSize: "15px" }}>
              <BarChart3 size={20} color="rgba(255,255,255,0.7)" />
              Real-time analytics & reports
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#64748b", margin: "0 0 40px", fontSize: "15px" }}>
            Sign in with your admin username
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "8px", letterSpacing: "0.5px" }}>
                USERNAME
              </label>
              <div style={{ position: "relative" }}>
                <User size={18} color="#94a3b8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 44px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontSize: "15px",
                    color: "#0f172a",
                    boxSizing: "border-box",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)"; }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "8px", letterSpacing: "0.5px" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 44px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    fontSize: "15px",
                    color: "#0f172a",
                    boxSizing: "border-box",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99, 102, 241, 0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                >
                  {showPass ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fecaca" }}>
                <span style={{ fontWeight: 800 }}>!</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                background: "#4f46e5",
                color: "white",
                border: "none",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.8 : 1,
                transition: "background 0.2s",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.background = "#4338ca"; }}
              onMouseLeave={(e) => e.target.style.background = "#4f46e5"}
            >
              {isLoading ? <Loader2 size={18} className="spinner" /> : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Demo Accounts List */}
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "center", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
              DEMO ACCOUNTS
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {demoAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => quickFill(acc.username, acc.pw)}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.01)"; }}
                >
                  <div style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "8px", 
                    background: acc.color, 
                    color: acc.textColor,
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    marginRight: "16px"
                  }}>
                    {acc.letter}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>
                      {acc.role}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {acc.username} <span style={{ opacity: 0.5 }}>•</span> {acc.pw}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6366f1" }}>
                    Fill →
                  </div>
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}