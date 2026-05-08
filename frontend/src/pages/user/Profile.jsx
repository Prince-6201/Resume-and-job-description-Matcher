import { useState } from "react";
import { Save } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await axios.put("/api/auth/profile", form);
      setSuccess("Profile updated successfully!");
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Profile" subtitle="Manage your account information" />
      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}
      >
        <Card style={{ textAlign: "center", padding: 36 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: 32,
            }}
          >
            {user?.role === "hr" ? "👔" : "👤"}
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {user?.name}
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {user?.email}
          </p>
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "var(--r-full)",
              background: "var(--indigo-l)",
              color: "var(--indigo)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {user?.role === "hr" ? "👔 HR Manager" : "👤 Candidate"}
          </span>
        </Card>

        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 20,
            }}
          >
            Account Details
          </h3>
          {[
            { label: "Full Name", key: "name", placeholder: "Your full name" },
            { label: "Phone", key: "phone", placeholder: "+91 98765 43210" },
            { label: "Location", key: "location", placeholder: "City, State" },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--gray-700)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {f.label}
              </label>
              <input
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--gray-700)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Email (read-only)
            </label>
            <input
              value={user?.email || ""}
              disabled
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--gray-700)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Role (read-only)
            </label>
            <input
              value={user?.role === "hr" ? "HR Manager" : "Candidate"}
              disabled
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
              }}
            />
          </div>
          {success && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--green-l)",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
                color: "var(--green-d)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--red-l)",
                borderRadius: 10,
                border: "1px solid #fecaca",
                color: "var(--red-d)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={save}
            disabled={loading}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              background: loading
                ? "var(--gray-200)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: loading ? "var(--gray-400)" : "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            <Save size={15} /> {loading ? "Saving…" : "Save Changes"}
          </button>
        </Card>
      </div>
    </div>
  );
}
