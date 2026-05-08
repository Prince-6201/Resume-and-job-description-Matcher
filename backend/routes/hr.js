const express = require("express");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse-fork");
const mammoth = require("mammoth");
const pool = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { uploadMultiple } = require("../middleware/upload");
const { extractSkills, computeMatch } = require("../utils/matcher");

const router = express.Router();

async function parseFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf8");
    }

    if (ext === ".pdf" || mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);

      const data = await pdfParse(buffer);
      return data.text;
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
    throw error;
  }
  return "";
}

router.post(
  "/upload-resumes",
  auth,
  requireRole("hr"),
  uploadMultiple,
  async (req, res) => {
    if (!req.files || !req.files.length)
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const text = await parseFile(file.path, file.mimetype);
        const skills = extractSkills(text);

        // Use filename as candidate name if not provided
        const candidateName = file.originalname
          .replace(/\.(pdf|docx|txt)$/i, "")
          .replace(/[-_]/g, " ");

        const [result] = await pool.query(
          `INSERT INTO hr_candidate_uploads
           (hr_user_id, candidate_name, candidate_email, file_path, extracted_skills)
         VALUES (?, ?, ?, ?, ?)`,
          [
            req.user.id,
            candidateName,
            `${candidateName.toLowerCase().replace(/\s/g, ".")}@candidate.com`,
            file.path,
            JSON.stringify(skills),
          ],
        );

        results.push({
          id: result.insertId,
          candidate_name: candidateName,
          skill_count: skills.length,
          file: file.originalname,
        });
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `${results.length} of ${req.files.length} resumes processed`,
      uploaded: results,
      errors,
    });
  },
);

router.get("/candidates", auth, requireRole("hr"), async (req, res) => {
  const { search = "", page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT id, candidate_name, candidate_email, extracted_skills, uploaded_at
       FROM hr_candidate_uploads
       WHERE hr_user_id = ? AND (candidate_name LIKE ? OR candidate_email LIKE ?)
       ORDER BY uploaded_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, like, like, Number(limit), offset],
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM hr_candidate_uploads
       WHERE hr_user_id = ? AND (candidate_name LIKE ? OR candidate_email LIKE ?)`,
      [req.user.id, like, like],
    );

    const candidates = rows.map((r) => ({
      ...r,
      extracted_skills:
        typeof r.extracted_skills === "string"
          ? JSON.parse(r.extracted_skills)
          : r.extracted_skills || [],
    }));

    return res.json({
      success: true,
      total: countRows[0].total,
      candidates,
    });
  } catch (err) {
    console.error("HR candidates error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/leaderboard", auth, requireRole("hr"), async (req, res) => {
  const { jd_id, jd_text, job_title = "Position" } = req.body;

  try {
    let jdSkills = [];

    if (jd_id) {
      const [rows] = await pool.query(
        "SELECT required_skills FROM job_descriptions WHERE id=?",
        [jd_id],
      );
      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "JD not found" });
      const raw = rows[0].required_skills;
      jdSkills = typeof raw === "string" ? JSON.parse(raw) : raw;
    } else if (jd_text) {
      jdSkills = extractSkills(jd_text);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Provide jd_id or jd_text" });
    }

    if (!jdSkills.length)
      return res
        .status(422)
        .json({ success: false, message: "No recognisable skills in JD" });

    // Fetch all candidates belonging to this HR
    const [candidates] = await pool.query(
      `SELECT id, candidate_name, candidate_email, extracted_skills, file_path
       FROM hr_candidate_uploads WHERE hr_user_id = ?`,
      [req.user.id],
    );

    const ranked = candidates
      .map((c) => {
        const skills =
          typeof c.extracted_skills === "string"
            ? JSON.parse(c.extracted_skills)
            : c.extracted_skills || [];
        const { matched, missing, percentage } = computeMatch(skills, jdSkills);
        return {
          id: c.id,
          candidate_name: c.candidate_name,
          candidate_email: c.candidate_email,
          skills,
          matched,
          missing,
          percentage,
          has_file: !!c.file_path,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return res.json({
      success: true,
      job_title,
      jd_skills: jdSkills,
      total: ranked.length,
      leaderboard: ranked,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/download/:id", auth, requireRole("hr"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT file_path, candidate_name FROM hr_candidate_uploads WHERE id = ? AND hr_user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found" });

    const { file_path, candidate_name } = rows[0];
    if (!file_path || !fs.existsSync(file_path))
      return res
        .status(404)
        .json({ success: false, message: "File not found on disk" });

    const ext = path.extname(file_path);
    res.download(file_path, `${candidate_name}${ext}`);
  } catch (err) {
    console.error("HR download error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//DELETE /api/hr/candidate/:id
router.delete("/candidate/:id", auth, requireRole("hr"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT file_path FROM hr_candidate_uploads WHERE id = ? AND hr_user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    // Remove file from disk
    const fp = rows[0].file_path;
    if (fp && fs.existsSync(fp)) fs.unlinkSync(fp);

    await pool.query("DELETE FROM hr_candidate_uploads WHERE id = ?", [
      req.params.id,
    ]);
    return res.json({ success: true, message: "Candidate deleted" });
  } catch (err) {
    console.error("HR delete error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
