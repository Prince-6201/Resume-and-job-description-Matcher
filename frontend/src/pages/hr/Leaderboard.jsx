import { useState, useEffect } from "react";
import { Trophy, Download, RefreshCw } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import { ScoreBadge } from "../../components/Badge";

export default function Leaderboard() {
  const [jdList, setJdList] = useState([]);
  const [selectedJd, setSelectedJd] = useState("");
  const [jdText, setJdText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    axios
      .get("/api/jd/list")
      .then(({ data }) => setJdList(data.jds || []))
      .catch(() => {});
  }, []);

  const analyze = async () => {
    if (!selectedJd && !jdText.trim()) return;
    setLoading(true);
    setAnalyzed(false);
    try {
      const payload = selectedJd
        ? {
            jd_id: Number(selectedJd),
            job_title:
              jdList.find((j) => j.id === Number(selectedJd))?.job_title ||
              "Position",
          }
        : { jd_text: jdText, job_title: "Custom Position" };
      const { data } = await axios.post("/api/hr/leaderboard", payload);
      if (data.success) {
        setResults(data.leaderboard || []);
        setAnalyzed(true);
      }
    } catch (e) {
      alert(e.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = (id, name) =>
    window.open(`/api/hr/download/${id}`, "_blank");

  const filtered = results.filter((r) => r.percentage >= minScore);
  const medals = ["🥇", "🥈", "🥉"];
  const mColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

  return (
    <div>
      <Header
        title="Leaderboard"
        subtitle="Rank all candidates against a job description"
      />
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--gray-700)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Select Saved JD
            </label>
            <select
              value={selectedJd}
              onChange={(e) => {
                setSelectedJd(e.target.value);
                setJdText("");
              }}
            >
              <option value="">— choose a saved JD —</option>
              {jdList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.job_title}
                </option>
              ))}
            </select>
          </div>
          {analyzed && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--gray-700)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Min Score Filter
                </label>
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  min={0}
                  max={100}
                  style={{ width: 80 }}
                />
              </div>
            </div>
          )}
        </div>
        {!selectedJd && (
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
              Or paste JD text
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description…"
              style={{ height: 100 }}
            />
          </div>
        )}
        <button
          onClick={analyze}
          disabled={loading || (!selectedJd && !jdText.trim())}
          style={{
            padding: "12px 28px",
            borderRadius: 12,
            background:
              (!selectedJd && !jdText.trim()) || loading
                ? "var(--gray-200)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            color:
              (!selectedJd && !jdText.trim()) || loading
                ? "var(--gray-400)"
                : "white",
            fontWeight: 700,
            fontSize: 14,
            cursor:
              (!selectedJd && !jdText.trim()) || loading
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="spin" /> Analysing…
            </>
          ) : (
            <>
              <Trophy size={15} /> Analyse All Candidates
            </>
          )}
        </button>
      </Card>

      {analyzed && (
        <>
          {filtered.slice(0, 3).length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 20,
                marginBottom: 24,
              }}
            >
              {filtered.slice(0, 3).map((c, i) => (
                <Card
                  key={c.id}
                  style={{
                    textAlign: "center",
                    border: `2px solid ${mColors[i]}40`,
                    background: `linear-gradient(160deg,white,${mColors[i]}12)`,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {medals[i]}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 22,
                      color: mColors[i],
                      marginBottom: 4,
                    }}
                  >
                    {c.percentage}%
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontSize: 15,
                      marginBottom: 2,
                    }}
                  >
                    {c.candidate_name}
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    {c.candidate_email}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "var(--r-full)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--green-d)",
                        background: "var(--green-l)",
                      }}
                    >
                      {(c.matched || []).length} matched
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "var(--r-full)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--red-d)",
                        background: "var(--red-l)",
                      }}
                    >
                      {(c.missing || []).length} missing
                    </span>
                  </div>
                  {c.has_file && (
                    <button
                      onClick={() => downloadResume(c.id, c.candidate_name)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 18px",
                        borderRadius: 8,
                        background: "#1e1b4b",
                        border: "none",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Download size={13} /> Download
                    </button>
                  )}
                </Card>
              ))}
            </div>
          )}

          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                All Candidates ({filtered.length})
              </h3>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Ranked by match score
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--gray-100)" }}>
                  {[
                    "Rank",
                    "Candidate",
                    "Email",
                    "Score",
                    "Matched",
                    "Missing",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid var(--gray-50)",
                      background: i < 3 ? `${mColors[i]}08` : "white",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 14px",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: 14,
                      }}
                    >
                      {c.candidate_name}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--text-secondary)",
                        fontSize: 13,
                      }}
                    >
                      {c.candidate_email}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 70,
                            background: "var(--gray-200)",
                            borderRadius: 4,
                            height: 7,
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
                            }}
                          />
                        </div>
                        <ScoreBadge pct={c.percentage} />
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--green-d)",
                        fontSize: 13,
                      }}
                    >
                      {(c.matched || []).length}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--red-d)",
                        fontSize: 13,
                      }}
                    >
                      {(c.missing || []).length}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {c.has_file ? (
                        <button
                          onClick={() => downloadResume(c.id, c.candidate_name)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "var(--indigo-l)",
                            border: "1px solid #c7d2fe",
                            color: "var(--indigo)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontFamily: "inherit",
                          }}
                        >
                          <Download size={12} /> Resume
                        </button>
                      ) : (
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          No file
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
