import { useState, useEffect } from "react";
import { Search, Save, Trash2 } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Badge from "../../components/Badge";

export default function HRJobDescription() {
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jdList, setJdList] = useState([]);

  const fetchList = () =>
    axios
      .get("/api/jd/list")
      .then(({ data }) => setJdList(data.jds || []))
      .catch(() => {});

  useEffect(() => {
    fetchList();
  }, []);

  const analyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const { data } = await axios.post("/api/jd/save", {
        job_title: jobTitle || "Untitled Position",
        description_text: jdText,
      });
      if (data.success) {
        setSkills(data.jd.required_skills || []);
        setSaved(true);
        fetchList();
      }
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    try {
      await axios.delete(`/api/jd/${id}`);
      fetchList();
    } catch (err_) {
      setError(err_.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <Header
        title="Job Description"
        subtitle="Create and manage JDs for candidate screening"
      />
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
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
                Job Title *
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
            Description *
          </label>
          <textarea
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              setSaved(false);
            }}
            placeholder="Paste the full job description here…"
            style={{ height: 280, marginBottom: 14 }}
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
              <Search size={15} /> {loading ? "Saving…" : "Analyze & Save JD"}
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
          {saved && skills.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 12,
                }}
              >
                🎯 Required Skills ({skills.length})
              </h4>
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
            </div>
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
            📋 Saved JDs ({jdList.length})
          </h3>
          {jdList.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              No JDs saved yet.
            </p>
          ) : (
            jdList.map((jd) => (
              <div
                key={jd.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid var(--gray-100)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  >
                    {jd.job_title}
                  </p>
                  <button
                    onClick={() => del(jd.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 2,
                      display: "flex",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge
                    label={`${(jd.required_skills || []).length} skills`}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      alignSelf: "center",
                    }}
                  >
                    {new Date(jd.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
