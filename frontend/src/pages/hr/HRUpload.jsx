import { useState, useRef } from "react";
import { Upload, Users, Trash2 } from "lucide-react";
import axios from "axios";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Badge from "../../components/Badge";

export default function HRUpload() {
  const [candidates, setCandidates] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const upload = async (files) => {
    if (!files?.length) return;
    setLoading(true);
    setError("");
    setProgress(`Uploading ${files.length} file(s)…`);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("resumes", f));
    try {
      const { data } = await axios.post("/api/hr/upload-resumes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        const newCands = (data.uploaded || []).map((u) => ({
          id: u.id,
          name: u.candidate_name,
          skillCount: u.skill_count,
          uploadedAt: new Date().toLocaleDateString(),
        }));
        setCandidates((prev) => [...prev, ...newCands]);
        setProgress(
          `✅ ${data.uploaded?.length || 0} of ${files.length} resumes processed successfully.`,
        );
      }
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const remove = (id) =>
    setCandidates((prev) => prev.filter((c) => c.id !== id));

  const fetchFromServer = async () => {
    try {
      const { data } = await axios.get("/api/hr/candidates");
      setCandidates(
        (data.candidates || []).map((c) => ({
          id: c.id,
          name: c.candidate_name,
          email: c.candidate_email,
          skillCount: (c.extracted_skills || []).length,
          uploadedAt: new Date(c.uploaded_at).toLocaleDateString(),
        })),
      );
    } catch (err_) {
      setError(err_.response?.data?.message || "Failed to fetch candidates");
    }
  };

  return (
    <div>
      <Header
        title="Upload Resumes"
        subtitle="Bulk-upload candidate resumes for mass analysis"
      />
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Upload size={17} color="var(--indigo)" /> Bulk Upload
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files);
            }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? "var(--indigo)" : "var(--gray-300)"}`,
              borderRadius: 14,
              padding: "52px 22px",
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
              multiple
              style={{ display: "none" }}
              onChange={(e) => upload(e.target.files)}
            />
            <div style={{ fontSize: 44, marginBottom: 12 }}>📁</div>
            <p
              style={{
                fontWeight: 700,
                color: "var(--gray-700)",
                marginBottom: 4,
              }}
            >
              Drop multiple resumes here
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              PDF · DOCX · TXT · Up to 100 files
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
              ⏳ {progress}
            </p>
          )}
          {!loading && progress && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "var(--green-l)",
                borderRadius: 10,
                border: "1px solid #bbf7d0",
                color: "var(--green-d)",
                fontSize: 13,
              }}
            >
              {progress}
            </div>
          )}
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

        <Card>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={17} color="var(--indigo)" /> Quick Actions
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            Load all previously uploaded candidates from the database, or clear
            the current session view.
          </p>
          <button
            onClick={fetchFromServer}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              marginBottom: 10,
            }}
          >
            <Users size={16} /> Load All from Database
          </button>
          <button
            onClick={() => setCandidates([])}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: "var(--red-l)",
              border: "1px solid #fecaca",
              color: "var(--red-d)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Clear Session View
          </button>
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              background: "var(--amber-l)",
              borderRadius: 10,
              border: "1px solid #fde68a",
              fontSize: 13,
              color: "var(--amber-d)",
            }}
          >
            <strong>Note:</strong> Uploaded files are parsed server-side. Skills
            are auto-extracted and stored in MySQL.
          </div>
        </Card>
      </div>

      {candidates.length > 0 && (
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
              Candidates ({candidates.length})
            </h3>
            <Badge label={`${candidates.length} loaded`} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--gray-100)" }}>
                {["Name", "Email", "Skills", "Uploaded", "Action"].map((h) => (
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
              {candidates.map((c, i) => (
                <tr
                  key={c.id || i}
                  style={{ borderBottom: "1px solid var(--gray-50)" }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontSize: 14,
                    }}
                  >
                    {c.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                    }}
                  >
                    {c.email || "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge label={`${c.skillCount || 0} skills`} />
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                    }}
                  >
                    {c.uploadedAt}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      onClick={() => remove(c.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 7,
                        background: "var(--red-l)",
                        border: "1px solid #fecaca",
                        color: "var(--red-d)",
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "inherit",
                      }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
