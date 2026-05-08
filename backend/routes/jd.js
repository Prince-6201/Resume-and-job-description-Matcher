const express = require("express");
const pool = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { extractSkills } = require("../utils/matcher");

const router = express.Router();

//POST /api/jd/save
router.post("/save", auth, async (req, res) => {
  const { job_title, description_text } = req.body;

  if (!job_title || !description_text)
    return res
      .status(400)
      .json({
        success: false,
        message: "job_title and description_text are required",
      });

  try {
    const skills = extractSkills(description_text);

    const [result] = await pool.query(
      `INSERT INTO job_descriptions (created_by, job_title, description_text, required_skills)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, job_title, description_text, JSON.stringify(skills)],
    );

    return res.status(201).json({
      success: true,
      message: "Job description saved",
      jd: { id: result.insertId, job_title, required_skills: skills },
    });
  } catch (err) {
    console.error("JD save error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/jd/list
router.get("/list", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, job_title, required_skills, created_at
       FROM job_descriptions WHERE created_by = ? ORDER BY created_at DESC`,
      [req.user.id],
    );

    const jds = rows.map((r) => ({
      ...r,
      required_skills:
        typeof r.required_skills === "string"
          ? JSON.parse(r.required_skills)
          : r.required_skills,
    }));

    return res.json({ success: true, jds });
  } catch (err) {
    console.error("JD list error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ET /api/jd/:id 
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM job_descriptions WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "JD not found" });

    const jd = rows[0];
    jd.required_skills =
      typeof jd.required_skills === "string"
        ? JSON.parse(jd.required_skills)
        : jd.required_skills;

    return res.json({ success: true, jd });
  } catch (err) {
    console.error("JD fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/jd/:id 
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM job_descriptions WHERE id = ? AND created_by = ?",
      [req.params.id, req.user.id],
    );
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: "JD not found or not yours" });

    return res.json({ success: true, message: "JD deleted" });
  } catch (err) {
    console.error("JD delete error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
