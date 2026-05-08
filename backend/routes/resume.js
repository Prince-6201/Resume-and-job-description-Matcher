const express = require("express");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse-fork"); 
const mammoth = require("mammoth");
const pool = require("../config/db");
const { auth } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { extractSkills } = require("../utils/matcher");

const router = express.Router();

async function parseFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf8");
    }

    if (ext === ".pdf" || mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      // pdf-parse-fork fixes the 'initialization failed' issue
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

// POST /api/resume/upload
router.post("/upload", auth, uploadSingle, async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });

  try {
    const text = await parseFile(req.file.path, req.file.mimetype);
    const skills = extractSkills(text);

    const [result] = await pool.query(
      `INSERT INTO resumes (user_id, original_name, file_path, extracted_text, extracted_skills)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.file.originalname,
        req.file.path,
        text,
        JSON.stringify(skills),
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed",
      resume: {
        id: result.insertId,
        original_name: req.file.originalname,
        extracted_skills: skills,
        skill_count: skills.length,
      },
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to parse resume" });
  }
});

// GET /api/resume/latest
router.get("/latest", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, original_name, extracted_skills, uploaded_at
       FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1`,
      [req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "No resume found" });

    const r = rows[0];
    r.extracted_skills =
      typeof r.extracted_skills === "string"
        ? JSON.parse(r.extracted_skills)
        : r.extracted_skills;

    return res.json({ success: true, resume: r });
  } catch (err) {
    console.error("Get latest resume error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//GET /api/resume/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM resumes WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });

    const r = rows[0];
    r.extracted_skills =
      typeof r.extracted_skills === "string"
        ? JSON.parse(r.extracted_skills)
        : r.extracted_skills;
    delete r.extracted_text; // don't send raw text in list view

    return res.json({ success: true, resume: r });
  } catch (err) {
    console.error("Get resume error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//GET /api/resume/download/:id
router.get("/download/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT file_path, original_name FROM resumes WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    const { file_path, original_name } = rows[0];
    if (!fs.existsSync(file_path))
      return res
        .status(404)
        .json({ success: false, message: "File missing on disk" });

    res.download(file_path, original_name);
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
