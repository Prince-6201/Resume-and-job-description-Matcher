import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [skills, setSkills] = useState([]);
  const [dragging, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const upload = useCallback(async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);
    setSuccess("");
    setError("");
    const fd = new FormData();
    fd.append("resume", f);
    try {
      const { data } = await axios.post("/api/resume/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        setSkills(data.resume.extracted_skills || []);
        setSuccess(`✅ ${data.resume.skill_count} skills detected!`);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed. Try pasting text.");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    const blob = new Blob([text], { type: "text/plain" });
    await upload(new File([blob], "resume.txt", { type: "text/plain" }));
  };

  return (
    <div>
      <Header
        title="Upload Resume"
        subtitle="Upload file or paste resume text"
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
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
            <Upload size={17} color="var(--indigo)" /> File Upload
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? "var(--indigo)" : "var(--gray-300)"}`,
              borderRadius: 14,
              padding: "48px 22px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "var(--indigo-l)" : "var(--bg-surface)",
              transition: "all .2s",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => upload(e.target.files[0])}
            />
            <div style={{ fontSize: 44, marginBottom: 12 }}>📄</div>
            <p
              style={{
                fontWeight: 700,
                color: "var(--gray-700)",
                marginBottom: 4,
              }}
            >
              {file ? file.name : "Drop resume here"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              PDF · DOCX · TXT · Max 10 MB
            </p>
          </div>
          {loading && (
            <p
              style={{
                marginTop: 12,
                color: "var(--indigo)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ⏳ Uploading…
            </p>
          )}
          {success && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "var(--green-l)",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
                color: "var(--green-d)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "var(--red-l)",
                borderRadius: 10,
                border: "1px solid #fecaca",
                color: "var(--red-d)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}
        </Card>
        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FileText size={17} color="var(--indigo)" /> Paste Text
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            Skills are auto-extracted from your text.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste resume text here…"
            style={{ height: 230, marginBottom: 14 }}
          />
          <button
            onClick={saveText}
            disabled={loading || !text.trim()}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background:
                !text.trim() || loading
                  ? "var(--gray-200)"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: !text.trim() || loading ? "var(--gray-400)" : "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: !text.trim() || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={15} /> Save Resume
          </button>
        </Card>
      </div>
      {skills.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 14,
            }}
          >
            ✅ Detected Skills ({skills.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((s) => (
              <span
                key={s}
                style={{
                  padding: "5px 13px",
                  background: "var(--indigo-l)",
                  borderRadius: "var(--r-full)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--indigo)",
                  border: "1px solid #c7d2fe",
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
