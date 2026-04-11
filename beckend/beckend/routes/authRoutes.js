const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const getPool = require("../config/mysql");
const { register, login, getMe, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const newId = () => crypto.randomBytes(12).toString("hex");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/setup-admin — one-time admin creation (uses secret key)
router.post("/setup-admin", async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;
    if (secret !== process.env.JWT_SECRET) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const pool = getPool();
    const [existing] = await pool.query("SELECT id, email FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (existing.length) {
      await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [existing[0].id]);
      return res.json({ success: true, message: "Role updated to admin", email: existing[0].email });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = newId();
    await pool.query(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'admin')",
      [id, name, email.toLowerCase().trim(), hashed]
    );
    res.status(201).json({ success: true, message: "Admin created", email: email.toLowerCase().trim() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/logout
router.post("/logout", protect, logout);

module.exports = router;
