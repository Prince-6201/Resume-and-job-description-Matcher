import { useState } from "react";
import {
  Zap,
  RefreshCw,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
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
import CircularProgress from "../../components/CircularProgress";
import SkillChip from "../../components/SkillChip";

export default function Matcher() {
  const [jdText, setJdText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runMatch = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await axios.post("/api/match/run", {
        jd_text: jdText,
        job_title: jobTitle || "Untitled Position",
      });
      if (data.success) setResult(data.match);
    } catch (e) {
      setError(
        e.response?.data?.message || "Match failed. Upload a resume first.",
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        ...result.matched.map((s) => ({
          name: s,
          value: 100,
          status: "matched",
        })),
        ...result.missing.map((s) => ({
          name: s,
          value: 0,
          status: "missing",
        })),
      ].slice(0, 16)
    : [];

  return (
    <div>
      <Header
        title="Resume Matcher"
        subtitle="AI-powered keyword matching engine"
      />
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
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
              Job Title
            </label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Backend Engineer"
            />
          </div>
        </div>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--gray-700)",
            display: "block",
            marginBottom: 6,
          }}
        >
          Job Description *
        </label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste job description here…"
          style={{ height: 160, marginBottom: 14 }}
        />
        <button
          onClick={runMatch}
          disabled={loading || !jdText.trim()}
          style={{
            padding: "12px 28px",
            borderRadius: 12,
            background:
              !jdText.trim() || loading
                ? "var(--gray-200)"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            color: !jdText.trim() || loading ? "var(--gray-400)" : "white",
            fontWeight: 700,
            fontSize: 14.5,
            cursor: !jdText.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="spin" /> Analyzing…
            </>
          ) : (
            <>
              <Zap size={15} /> Run Match
            </>
          )}
        </button>
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "var(--red-l)",
              borderRadius: 10,
              color: "var(--red-d)",
              fontSize: 13,
            }}
          >
            <AlertCircle
              size={14}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />
            {error}
          </div>
        )}
      </Card>

      {result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "270px 1fr",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <Card
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
              }}
            >
              <CircularProgress percentage={result.percentage} />
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: 18,
                  marginBottom: 6,
                }}
              >
                Overall Match
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                {result.percentage >= 75
                  ? "🎉 Excellent! Strong candidate."
                  : result.percentage >= 50
                    ? "👍 Good match. Close a few gaps."
                    : "⚠️ Significant gap. Focus on missing skills."}
              </p>
            </Card>
            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--green-d)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle size={15} color="var(--green)" /> Matched (
                    {result.matched.length})
                  </h4>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {result.matched.length > 0 ? (
                      result.matched.map((s) => (
                        <SkillChip key={s} skill={s} matched />
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        None matched.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--red-d)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <XCircle size={15} color="var(--red)" /> Missing (
                    {result.missing.length})
                  </h4>
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {result.missing.length > 0 ? (
                      result.missing.map((s) => (
                        <SkillChip key={s} skill={s} matched={false} />
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        Perfect match!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 20,
                }}
              >
                📊 Skill Match Analysis
              </h3>
              <ResponsiveContainer
                width="100%"
                height={Math.max(180, chartData.length * 26)}
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 20, right: 30, top: 4, bottom: 4 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11.5 }}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Proficiency"]} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((e, i) => (
                      <Cell
                        key={i}
                        fill={
                          e.status === "matched" ? "var(--green)" : "var(--red)"
                        }
                        fillOpacity={0.82}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {result.recommendations?.length > 0 && (
            <Card>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Sparkles size={17} color="var(--indigo)" /> Recommendations
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {result.recommendations.map(({ skill, resource }) => (
                  <div
                    key={skill}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "linear-gradient(135deg,#fdf4ff,#ede9fe)",
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--violet)",
                        marginBottom: 6,
                        fontSize: 13.5,
                      }}
                    >
                      🎯 Learn: {skill}
                    </div>
                    <div
                      style={{
                        color: "#4c1d95",
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      {resource}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
