const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

// sign JWT
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

//POST /api/auth/register
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    role = "user",
    phone = "",
    location = "",
  } = req.body;

  if (!name || !email || !password)
    return res
      .status(400)
      .json({
        success: false,
        message: "name, email and password are required",
      });

  if (!["user", "hr"].includes(role))
    return res
      .status(400)
      .json({ success: false, message: 'role must be "user" or "hr"' });

  try {
    // Check duplicate email
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, phone, location) VALUES (?,?,?,?,?,?)",
      [name, email, hash, role, phone, location],
    );

    const user = { id: result.insertId, name, email, role };
    return res
      .status(201)
      .json({ success: true, token: signToken(user), user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "email and password are required" });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows.length)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const { password: _pw, ...safeUser } = user;
    return res.json({
      success: true,
      token: signToken(safeUser),
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, phone, location, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//PUT /api/auth/profile
router.put("/profile", auth, async (req, res) => {
  const { name, phone, location } = req.body;
  try {
    await pool.query(
      "UPDATE users SET name=?, phone=?, location=? WHERE id=?",
      [name, phone, location, req.user.id],
    );
    return res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
