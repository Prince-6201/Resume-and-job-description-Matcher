const express = require("express");
const pool = require("../config/db");
const { auth } = require("../middleware/auth");
const {
  extractSkills,
  computeMatch,
  getRecommendations,
} = require("../utils/matcher");

const router = express.Router();

// POST /api/match/run

router.post("/run", auth, async (req, res) => {
  const {
    resume_id,
    jd_id,
    resume_text,
    jd_text,
    job_title = "Untitled Position",
  } = req.body;

  try {
    let resumeSkills = [];
    let jdSkills = [];
    let resolvedJdId = jd_id || null;

    // Resolve resume skills
    if (resume_id) {
      const [rows] = await pool.query(
        "SELECT extracted_skills FROM resumes WHERE id = ? AND user_id = ?",
        [resume_id, req.user.id],
      );
      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "Resume not found" });

      const raw = rows[0].extracted_skills;
      resumeSkills = typeof raw === "string" ? JSON.parse(raw) : raw || [];
    } else if (resume_text) {
      resumeSkills = extractSkills(resume_text);
    } else {
      // auto-load latest resume
      const [rows] = await pool.query(
        "SELECT extracted_skills FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1",
        [req.user.id],
      );
      if (rows.length) {
        const raw = rows[0].extracted_skills;
        resumeSkills = typeof raw === "string" ? JSON.parse(raw) : raw || [];
      }
    }

    // Resolve JD skills
    if (jd_id) {
      const [rows] = await pool.query(
        "SELECT required_skills FROM job_descriptions WHERE id = ?",
        [jd_id],
      );
      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, message: "JD not found" });

      const raw = rows[0].required_skills;
      jdSkills = typeof raw === "string" ? JSON.parse(raw) : raw || [];
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
        .json({
          success: false,
          message: "No recognisable skills found in JD",
        });

    // Run match
    const { matched, missing, percentage } = computeMatch(
      resumeSkills,
      jdSkills,
    );
    const recommendations = getRecommendations(missing);

    //Persist result
    const [result] = await pool.query(
      `INSERT INTO matches
         (user_id, jd_id, job_title, match_percentage, matched_skills, missing_skills)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        resolvedJdId,
        job_title,
        percentage,
        JSON.stringify(matched),
        JSON.stringify(missing),
      ],
    );

    return res.status(201).json({
      success: true,
      match: {
        id: result.insertId,
        job_title,
        percentage,
        matched,
        missing,
        recommendations,
      },
    });
  } catch (err) {
    console.error("Match run error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//  GET /api/match/history
router.get("/history", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, job_title, match_percentage, matched_skills, missing_skills, created_at
       FROM matches WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id],
    );

    const history = rows.map((r) => ({
      ...r,
      matched_skills:
        typeof r.matched_skills === "string"
          ? JSON.parse(r.matched_skills)
          : r.matched_skills,
      missing_skills:
        typeof r.missing_skills === "string"
          ? JSON.parse(r.missing_skills)
          : r.missing_skills,
    }));

    return res.json({ success: true, history });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/match/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM matches WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    const m = rows[0];
    m.matched_skills =
      typeof m.matched_skills === "string"
        ? JSON.parse(m.matched_skills)
        : m.matched_skills;
    m.missing_skills =
      typeof m.missing_skills === "string"
        ? JSON.parse(m.missing_skills)
        : m.missing_skills;
    m.recommendations = getRecommendations(m.missing_skills);

    return res.json({ success: true, match: m });
  } catch (err) {
    console.error("Match fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
