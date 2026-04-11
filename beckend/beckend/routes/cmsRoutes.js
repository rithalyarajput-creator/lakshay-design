const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const parseJSON = (val, fb) => {
  if (!val) return fb;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fb; }
};

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  slug: row.slug, title: row.title,
  content: row.content || "",
  contactInfo: parseJSON(row.contactInfo, null),
  updatedAt: row.updatedAt,
} : null;

// GET /api/cms/:slug
router.get("/:slug", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_pages WHERE slug = ?", [req.params.slug]);
    if (!rows.length) {
      return res.json({ success: true, data: { slug: req.params.slug, content: "", contactInfo: null } });
    }
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cms/:slug (admin save)
router.post("/:slug", async (req, res) => {
  try {
    const pool = getPool();
    const { content, title, contactInfo } = req.body;
    const [existing] = await pool.query("SELECT id FROM cms_pages WHERE slug = ?", [req.params.slug]);
    if (existing.length) {
      const fields = [];
      const vals = [];
      if (content !== undefined) { fields.push("content = ?"); vals.push(content); }
      if (title) { fields.push("title = ?"); vals.push(title); }
      if (contactInfo) { fields.push("contactInfo = ?"); vals.push(JSON.stringify(contactInfo)); }
      if (fields.length) {
        vals.push(req.params.slug);
        await pool.query(`UPDATE cms_pages SET ${fields.join(", ")} WHERE slug = ?`, vals);
      }
    } else {
      const id = newId();
      await pool.query(
        "INSERT INTO cms_pages (id, slug, title, content, contactInfo) VALUES (?, ?, ?, ?, ?)",
        [id, req.params.slug, title || req.params.slug, content || "", contactInfo ? JSON.stringify(contactInfo) : null]
      );
    }
    const [rows] = await pool.query("SELECT * FROM cms_pages WHERE slug = ?", [req.params.slug]);
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
