import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Target,
  Briefcase,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import { ScoreBadge } from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    axios
      .get("/api/match/history")
      .then((r) => setHistory(r.data.history || []))
      .catch(() => {});
    axios
      .get("/api/resume/latest")
      .then((r) => setResume(r.data.resume || null))
      .catch(() => {});
  }, []);

  const stats = [
    {
      label: "Resume",
      value: resume ? "Uploaded" : "Not uploaded",
      icon: FileText,
      color: resume ? "var(--green)" : "var(--red)",
      bg: resume ? "var(--green-l)" : "var(--red-l)",
    },
    {
      label: "Skills Found",
      value: resume ? `${(resume.extracted_skills || []).length}` : "—",
      icon: Target,
      color: "var(--indigo)",
      bg: "var(--indigo-l)",
    },
    {
      label: "Total Matches",
      value: history.length,
      icon: Briefcase,
      color: "var(--violet)",
      bg: "var(--violet-l)",
    },
    {
      label: "Best Match",
      value: history[0] ? `${history[0].match_percentage}%` : "—",
      icon: TrendingUp,
      color: "var(--amber)",
      bg: "var(--amber-l)",
    },
  ];

  const steps = [
    { text: "Upload your resume", done: !!resume, path: "/upload" },
    { text: "Add a job description", done: history.length > 0, path: "/jd" },
    { text: "Run the matcher", done: history.length > 0, path: "/matcher" },
    { text: "Review recommendations", done: false, path: "/matcher" },
  ];

  return (
    <div>
      <Header
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Candidate"} 👋`}
        subtitle="Your job-search overview"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <Card
              key={st.label}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: st.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={st.color} />
              </div>
              <div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  {st.label}
                </p>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  {st.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 18,
            }}
          >
            🚀 Quick Start
          </h3>
          {steps.map((s, i) => (
            <div
              key={i}
              onClick={() => navigate(s.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: s.done ? "var(--green)" : "var(--gray-200)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.done ? (
                  <CheckCircle size={16} color="white" />
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--gray-500)",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  color: s.done ? "var(--green-d)" : "var(--gray-700)",
                  fontWeight: s.done ? 600 : 400,
                  textDecoration: s.done ? "line-through" : "none",
                  opacity: s.done ? 0.7 : 1,
                }}
              >
                {s.text}
              </span>
            </div>
          ))}
        </Card>
        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 18,
            }}
          >
            📋 Recent Matches
          </h3>
          {history.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              No matches yet.
            </p>
          ) : (
            history.slice(0, 6).map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--gray-100)",
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--gray-700)",
                  }}
                  className="truncate"
                >
                  {item.job_title}
                </span>
                <ScoreBadge pct={item.match_percentage} />
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
