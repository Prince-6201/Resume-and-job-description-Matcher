import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trophy, Users, CheckCircle } from "lucide-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Card from "../../components/Card";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, jds: 0 });
  const [topCands, setTopCands] = useState([]);
  const [jdList, setJdList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios
        .get("/api/hr/candidates?limit=1")
        .catch(() => ({ data: { total: 0 } })),
      axios.get("/api/jd/list").catch(() => ({ data: { jds: [] } })),
    ])
      .then(([cRes, jRes]) => {
        const jds = jRes.data.jds || [];
        setStats({ total: cRes.data.total || 0, jds: jds.length });
        setJdList(jds.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const runQuickLeaderboard = async (jd) => {
    try {
      const { data } = await axios.post("/api/hr/leaderboard", {
        jd_id: jd.id,
        job_title: jd.job_title,
      });
      setTopCands((data.leaderboard || []).slice(0, 5));
    } catch (_err) {
      console.error("Error running quick leaderboard:", _err);
      alert("Failed to run leaderboard. Please try again.");
    }
  };

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#9ca3af", "#9ca3af"];

  const statCards = [
    {
      label: "Resumes Loaded",
      value: stats.total,
      icon: FileText,
      color: "var(--indigo)",
      bg: "var(--indigo-l)",
    },
    {
      label: "JDs Saved",
      value: stats.jds,
      icon: CheckCircle,
      color: "var(--violet)",
      bg: "var(--violet-l)",
    },
    {
      label: "Top Score",
      value: topCands[0] ? `${topCands[0].percentage}%` : "N/A",
      icon: Trophy,
      color: "var(--amber)",
      bg: "var(--amber-l)",
    },
    {
      label: "Analysed",
      value: topCands.length ? topCands.length : "—",
      icon: Users,
      color: "var(--green)",
      bg: "var(--green-l)",
    },
  ];

  return (
    <div>
      <Header
        title={`HR Dashboard 👔`}
        subtitle={`Welcome, ${user?.name} — Recruitment command centre`}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        {statCards.map((st) => {
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            📋 Saved JDs — Quick Rank
          </h3>
          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : jdList.length === 0 ? (
            <div style={{ textAlign: "center", padding: 28 }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                No JDs yet.
              </p>
              <button
                onClick={() => navigate("/hr/jd")}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "var(--indigo-l)",
                  border: "1px solid #c7d2fe",
                  color: "var(--indigo)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Add Job Description
              </button>
            </div>
          ) : (
            jdList.map((jd) => (
              <div
                key={jd.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--gray-100)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  >
                    {jd.job_title}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {(jd.required_skills || []).length} required skills
                  </p>
                </div>
                <button
                  onClick={() => runQuickLeaderboard(jd)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "none",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🏆 Rank
                </button>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            🏆 Top Candidates
          </h3>
          {topCands.length === 0 ? (
            <div style={{ textAlign: "center", padding: 28 }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                Click "Rank" on a JD to see top candidates.
              </p>
            </div>
          ) : (
            topCands.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--gray-100)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{medals[i]}</span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: 14,
                      marginBottom: 3,
                    }}
                  >
                    {c.candidate_name}
                  </p>
                  <div
                    style={{
                      background: "var(--gray-200)",
                      borderRadius: 4,
                      height: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${c.percentage}%`,
                        height: "100%",
                        borderRadius: 4,
                        background:
                          c.percentage >= 75
                            ? "var(--green)"
                            : c.percentage >= 50
                              ? "var(--amber)"
                              : "var(--red)",
                        transition: "width .8s ease",
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    color: medalColors[i],
                    fontSize: 16,
                    minWidth: 40,
                    textAlign: "right",
                  }}
                >
                  {c.percentage}%
                </span>
              </div>
            ))
          )}
        </Card>
      </div>

      {topCands.length > 0 && (
        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 20,
            }}
          >
            📊 Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={topCands}
              margin={{ top: 0, right: 10, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="candidate_name"
                tick={{ fontSize: 10 }}
                tickFormatter={(n) => n.split(" ")[0]}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Match"]} />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {topCands.map((c, i) => (
                  <Cell
                    key={i}
                    fill={
                      c.percentage >= 75
                        ? "var(--green)"
                        : c.percentage >= 50
                          ? "var(--amber)"
                          : "var(--red)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginTop: 24,
        }}
      >
        {[
          {
            label: "Upload Resumes",
            emoji: "📁",
            path: "/hr/upload",
            desc: "Add candidate resumes in bulk",
          },
          {
            label: "Add JD",
            emoji: "📝",
            path: "/hr/jd",
            desc: "Save a new job description",
          },
          {
            label: "Full Leaderboard",
            emoji: "🏆",
            path: "/hr/leaderboard",
            desc: "View all ranked candidates",
          },
        ].map((a) => (
          <Card
            key={a.label}
            style={{ textAlign: "center", cursor: "pointer", padding: 24 }}
            onClick={() => navigate(a.path)}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{a.emoji}</div>
            <p
              style={{
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              {a.label}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {a.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
