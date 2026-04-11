const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const getPool = require("../config/mysql");
const { protect } = require("../middleware/auth");

const newId = () => crypto.randomBytes(12).toString("hex");

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  name: row.name, location: row.location,
  review: row.text, text: row.text,
  rating: row.rating, image: row.image,
  isActive: !!row.isActive,
  createdAt: row.createdAt,
} : null;

// GET all (admin)
router.get("/all", protect, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY createdAt DESC");
    res.json({ success: true, data: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET active (frontend)
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE isActive = 1 ORDER BY createdAt ASC");
    res.json({ success: true, data: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST create
router.post("/", protect, async (req, res) => {
  try {
    const { name, review, text, rating, location, image, isActive } = req.body;
    const pool = getPool();
    const id = newId();
    const reviewText = review || text || "";
    await pool.query(
      "INSERT INTO testimonials (id, name, location, text, rating, image, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name || "", location || "", reviewText, rating || 5, image || "", isActive !== false ? 1 : 0]
    );
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [id]);
    res.status(201).json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT update
router.put("/:id", protect, async (req, res) => {
  try {
    const pool = getPool();
    const fields = [];
    const vals = [];
    if (req.body.name !== undefined) { fields.push("name = ?"); vals.push(req.body.name); }
    if (req.body.location !== undefined) { fields.push("location = ?"); vals.push(req.body.location); }
    const t = req.body.review || req.body.text;
    if (t !== undefined) { fields.push("text = ?"); vals.push(t); }
    if (req.body.rating !== undefined) { fields.push("rating = ?"); vals.push(req.body.rating); }
    if (req.body.image !== undefined) { fields.push("image = ?"); vals.push(req.body.image); }
    if (req.body.isActive !== undefined) { fields.push("isActive = ?"); vals.push(req.body.isActive ? 1 : 0); }
    if (!fields.length) return res.status(400).json({ success: false, message: "Nothing to update." });
    vals.push(req.params.id);
    await pool.query(`UPDATE testimonials SET ${fields.join(", ")} WHERE id = ?`, vals);
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE
router.delete("/:id", protect, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
