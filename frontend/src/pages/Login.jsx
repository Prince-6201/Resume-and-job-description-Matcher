import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const user =
        mode === "login"
          ? await login(form.email, form.password)
          : await register({ ...form, role });
      navigate(user.role === "hr" ? "/hr/dashboard" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "44px 40px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 25px 80px rgba(30,27,75,.45)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "linear-gradient(135deg,#818cf8,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(99,102,241,.4)",
            }}
          >
            <Target size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#1e1b4b",
              letterSpacing: -1,
            }}
          >
            ResuMatch
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
            AI-Powered Resume & JD Matcher
          </p>
        </div>
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#4f46e5" : "#64748b",
                fontFamily: "inherit",
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 8,
            }}
          >
            Role
          </label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { r: "user", l: "Candidate", i: "👤" },
              { r: "hr", l: "HR Manager", i: "👔" },
            ].map(({ r, l, i }) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: `2px solid ${role === r ? "#6366f1" : "#e5e7eb"}`,
                  background: role === r ? "#eef2ff" : "white",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 22 }}>{i}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: role === r ? "#6366f1" : "#374151",
                  }}
                >
                  {l}
                </span>
              </button>
            ))}
          </div>
        </div>
        {mode === "register" && (
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 24, position: "relative" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <button
            onClick={() => setShowPw((s) => !s)}
            style={{
              position: "absolute",
              right: 12,
              bottom: 10,
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fef2f2",
              borderRadius: 10,
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: loading
              ? "#e5e7eb"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            color: loading ? "#9ca3af" : "white",
            fontWeight: 800,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {loading
            ? "Please wait…"
            : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
        </button>
        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          Demo: user@demo.com / hr@demo.com · password123
        </p>
      </div>
    </div>
  );
}
