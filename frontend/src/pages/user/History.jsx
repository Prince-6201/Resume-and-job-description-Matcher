import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import { ScoreBadge } from "../../components/Badge";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/match/history")
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div>
      <Header
        title="Match History"
        subtitle="All your previous matching results"
      />
      <Card>
        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: 20 }}>Loading…</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: 52 }}>
            <Clock
              size={44}
              color="var(--gray-200)"
              style={{ display: "block", margin: "0 auto 14px" }}
            />
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
              No history yet. Run your first match!
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--gray-100)" }}>
                {["#", "Job Title", "Score", "Matched", "Missing", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 14px",
                        textAlign: "left",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => {
                const matched = Array.isArray(item.matched_skills)
                  ? item.matched_skills
                  : [];
                const missing = Array.isArray(item.missing_skills)
                  ? item.missing_skills
                  : [];
                return (
                  <tr
                    key={item.id || i}
                    style={{ borderBottom: "1px solid var(--gray-50)" }}
                  >
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: 14,
                      }}
                    >
                      {item.job_title}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <ScoreBadge pct={item.match_percentage} />
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "var(--green-d)",
                        fontSize: 13,
                      }}
                    >
                      {matched.length} skills
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "var(--red-d)",
                        fontSize: 13,
                      }}
                    >
                      {missing.length} skills
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        color: "var(--text-secondary)",
                        fontSize: 13,
                      }}
                    >
                      {fmt(item.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
