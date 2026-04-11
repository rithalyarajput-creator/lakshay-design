const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const getPool = require("../config/mysql");
const { protect, admin } = require("../middleware/auth");

const newId = () => crypto.randomBytes(12).toString("hex");

const parseJSON = (val, fb) => {
  if (!val) return fb;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fb; }
};

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  title: row.title, slug: row.slug,
  excerpt: row.excerpt, content: row.content,
  image: row.image, author: row.author,
  tags: parseJSON(row.tags, []),
  readTime: row.readTime,
  isPublished: !!row.isPublished,
  publishedAt: row.publishedAt,
  views: row.views || 0,
  createdAt: row.createdAt,
} : null;

function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

// GET /admin/all — must be before /:slug to avoid "admin" matching as a slug
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM blogs ORDER BY createdAt DESC");
    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM blogs");
    res.json({ success: true, data: rows.map(fmt), total });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// GET all published posts (public)
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      "SELECT id, title, slug, excerpt, image, author, tags, readTime, publishedAt, views, createdAt FROM blogs WHERE isPublished = 1 ORDER BY publishedAt DESC, createdAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM blogs WHERE isPublished = 1");
    res.json({ success: true, data: rows.map(fmt), total, page });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// GET single post by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ? AND isPublished = 1", [req.params.slug]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Post not found" });
    await pool.query("UPDATE blogs SET views = views + 1 WHERE id = ?", [rows[0].id]);
    rows[0].views = (rows[0].views || 0) + 1;
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// POST create post (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { title, excerpt, content, image, author, tags, readTime, isPublished } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const pool = getPool();
    let slug = makeSlug(title);
    const [existing] = await pool.query("SELECT id FROM blogs WHERE slug = ?", [slug]);
    if (existing.length) slug = slug + "-" + Date.now();
    const tagArr = Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()) : []);
    const pub = !!isPublished;
    const id = newId();
    await pool.query(
      `INSERT INTO blogs (id, title, slug, excerpt, content, image, author, tags, readTime, isPublished, publishedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, slug, excerpt || "", content || "", image || "", author || "Amshine Team",
        JSON.stringify(tagArr), readTime || 3, pub ? 1 : 0, pub ? new Date() : null]
    );
    const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);
    res.status(201).json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT update post (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { title, excerpt, content, image, author, tags, readTime, isPublished } = req.body;
    const pool = getPool();
    const [existing] = await pool.query("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: "Not found" });
    const post = existing[0];
    const fields = [];
    const vals = [];
    if (title !== undefined && title !== post.title) {
      let slug = makeSlug(title);
      const [dup] = await pool.query("SELECT id FROM blogs WHERE slug = ? AND id != ?", [slug, post.id]);
      if (dup.length) slug = slug + "-" + Date.now();
      fields.push("slug = ?"); vals.push(slug);
      fields.push("title = ?"); vals.push(title);
    }
    if (excerpt !== undefined) { fields.push("excerpt = ?"); vals.push(excerpt); }
    if (content !== undefined) { fields.push("content = ?"); vals.push(content); }
    if (image !== undefined) { fields.push("image = ?"); vals.push(image); }
    if (author !== undefined) { fields.push("author = ?"); vals.push(author); }
    if (tags !== undefined) {
      const tagArr = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());
      fields.push("tags = ?"); vals.push(JSON.stringify(tagArr));
    }
    if (readTime !== undefined) { fields.push("readTime = ?"); vals.push(readTime); }
    if (isPublished !== undefined) {
      fields.push("isPublished = ?"); vals.push(isPublished ? 1 : 0);
      if (isPublished && !post.isPublished) { fields.push("publishedAt = ?"); vals.push(new Date()); }
    }
    if (fields.length) {
      vals.push(req.params.id);
      await pool.query(`UPDATE blogs SET ${fields.join(", ")} WHERE id = ?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE post (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Post deleted" });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

module.exports = router;
