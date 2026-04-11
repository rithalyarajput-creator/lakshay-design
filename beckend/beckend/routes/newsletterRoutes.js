const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const getPool = require("../config/mysql");
const { protect, admin } = require("../middleware/auth");

const newId = () => crypto.randomBytes(12).toString("hex");
const fmt = (row) => row ? { _id: row.id, id: row.id, email: row.email, name: row.name, isActive: !!row.isActive, createdAt: row.createdAt } : null;

// POST /api/newsletter/subscribe (public)
router.post("/subscribe", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  try {
    const pool = getPool();
    const clean = email.toLowerCase().trim();
    const [existing] = await pool.query("SELECT * FROM newsletters WHERE email = ?", [clean]);
    if (existing.length) {
      if (!existing[0].isActive) {
        await pool.query("UPDATE newsletters SET isActive = 1 WHERE id = ?", [existing[0].id]);
        return res.json({ success: true, message: "You've been re-subscribed!" });
      }
      return res.json({ success: true, message: "You're already subscribed!" });
    }
    const id = newId();
    await pool.query("INSERT INTO newsletters (id, email, name, isActive) VALUES (?, ?, ?, 1)", [id, clean, name || ""]);
    res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong. Try again!" });
  }
});

// GET /api/newsletter/subscribers (admin only)
router.get("/subscribers", protect, admin, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM newsletters ORDER BY createdAt DESC");
    res.json({ success: true, data: rows.map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/newsletter/subscribers/:id (admin only)
router.delete("/subscribers/:id", protect, admin, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM newsletters WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Subscriber removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
