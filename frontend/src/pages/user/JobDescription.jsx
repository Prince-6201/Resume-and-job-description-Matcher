import { useState } from "react";
import { Search, Save } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";

export default function JobDescription() {
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [skills, setSkills] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/jd/save", {
        job_title: jobTitle || "Untitled Position",
        description_text: jdText,
      });
      if (data.success) {
        setSkills(data.jd.required_skills || []);
        setAnalyzed(true);
        setSaved(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Job Description"
        subtitle="Paste JD to extract required skills"
      />
      <Card>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 16,
            marginBottom: 18,
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
              placeholder="e.g. Senior React Developer"
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
          onChange={(e) => {
            setJdText(e.target.value);
            setAnalyzed(false);
            setSaved(false);
          }}
          placeholder="Paste full job description…"
          style={{ height: 300, marginBottom: 14 }}
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={analyze}
            disabled={loading || !jdText.trim()}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              background:
                !jdText.trim() || loading
                  ? "var(--gray-200)"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: !jdText.trim() || loading ? "var(--gray-400)" : "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: !jdText.trim() || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            <Search size={15} /> {loading ? "Analyzing…" : "Analyze & Save"}
          </button>
          {saved && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--green-d)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Save size={14} /> Saved!
            </span>
          )}
        </div>
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
            {error}
          </div>
        )}
      </Card>
      {analyzed && skills.length > 0 && (
        <Card style={{ marginTop: 22 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 14,
            }}
          >
            🎯 Required Skills ({skills.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((s) => (
              <span
                key={s}
                style={{
                  padding: "5px 13px",
                  background: "var(--violet-l)",
                  borderRadius: "var(--r-full)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--violet)",
                  border: "1px solid #e9d5ff",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
