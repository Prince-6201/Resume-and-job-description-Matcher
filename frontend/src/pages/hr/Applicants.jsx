import { useState, useEffect } from "react";
import { Search, Users, Download, RefreshCw } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Badge, { ScoreBadge } from "../../components/Badge";

export default function Applicants() {
  const [candidates, setCandidates] = useState([]);
  const [jdList, setJdList] = useState([]);
  const [selectedJd, setSelectedJd] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("grid"); // 'grid' | 'table'

  const fetchCandidates = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/hr/candidates?search=${q}&limit=100`,
      );
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    axios
      .get("/api/jd/list")
      .then(({ data }) => setJdList(data.jds || []))
      .catch((err) => {
        console.error("Error fetching JDs:", err);
      });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const getScore = (c) => {
    const jd = jdList.find((j) => j.id === Number(selectedJd));
    if (!jd) return null;
    const jdSkills = (jd.required_skills || []).map((s) => s.toLowerCase());
    const cSkills = (c.extracted_skills || []).map((s) => s.toLowerCase());
    const matched = jdSkills.filter((s) => cSkills.includes(s));
    return Math.round((matched.length / jdSkills.length) * 100);
  };

  return (
    <div>
      <Header
        title="All Applicants"
        subtitle="Browse & search your entire candidate pool"
      />

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--gray-700)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Score against JD
            </label>
            <select
              value={selectedJd}
              onChange={(e) => setSelectedJd(e.target.value)}
            >
              <option value="">— no scoring —</option>
              {jdList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.job_title}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["grid", "table"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: view === v ? "var(--indigo)" : "white",
                  color: view === v ? "white" : "var(--gray-700)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {v === "grid" ? "⊞ Grid" : "☰ Table"}
              </button>
            ))}
            <button
              onClick={() => fetchCandidates(search)}
              style={{
                padding: "9px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--gray-700)",
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <Badge label={`${candidates.length} candidates`} />
        </div>
      </Card>

      {loading ? (
        <Card style={{ textAlign: "center", padding: 52 }}>
          <div
            className="spin"
            style={{
              width: 36,
              height: 36,
              border: "4px solid var(--gray-200)",
              borderTopColor: "var(--indigo)",
              borderRadius: "50%",
              margin: "0 auto 14px",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading candidates…</p>
        </Card>
      ) : candidates.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 52 }}>
          <Users
            size={48}
            color="var(--gray-200)"
            style={{ display: "block", margin: "0 auto 14px" }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            No candidates found. Upload resumes to get started.
          </p>
        </Card>
      ) : view === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
            gap: 16,
          }}
        >
          {candidates.map((c) => {
            const score = getScore(c);
            return (
              <Card key={c.id} style={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontSize: 14.5,
                        marginBottom: 2,
                      }}
                    >
                      {c.candidate_name}
                    </p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {c.candidate_email}
                    </p>
                  </div>
                  {score !== null && <ScoreBadge pct={score} />}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    marginBottom: 12,
                  }}
                >
                  {(c.extracted_skills || []).slice(0, 5).map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: "2px 8px",
                        background: "var(--indigo-l)",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--indigo)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {(c.extracted_skills || []).length > 5 && (
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "var(--gray-100)",
                        borderRadius: 10,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      +{(c.extracted_skills || []).length - 5}
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    window.open(`/api/hr/download/${c.id}`, "_blank")
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    background: "#1e1b4b",
                    border: "none",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: "inherit",
                  }}
                >
                  <Download size={13} /> Download Resume
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--gray-100)" }}>
                {["#", "Name", "Email", "Skills", "Score", "Action"].map(
                  (h) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => {
                const score = getScore(c);
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid var(--gray-50)" }}
                  >
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      {i + 1}
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
                      <Badge label={`${(c.extracted_skills || []).length}`} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {score !== null ? (
                        <ScoreBadge pct={score} />
                      ) : (
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 12 }}
                        >
                          Select JD
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={() =>
                          window.open(`/api/hr/download/${c.id}`, "_blank")
                        }
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
