const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, admin } = require("../middleware/auth");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, trim: true },
  excerpt: { type: String, default: "" },
  content: { type: String, default: "" },
  image: { type: String, default: "" },
  author: { type: String, default: "Amshine Team" },
  tags: [String],
  readTime: { type: Number, default: 3 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
}, { timestamps: true });

function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').substring(0,80);
}

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

// GET all published posts (public)
router.get("/", async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page)-1) * Number(limit);
    const posts = await Blog.find({ isPublished: true }).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).select('-content');
    const total = await Blog.countDocuments({ isPublished: true });
    res.json({ success: true, data: posts, total, page: Number(page) });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// GET single post by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    post.views += 1;
    await post.save();
    res.json({ success: true, data: post });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// GET all posts for admin (protected)
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const posts = await Blog.find().sort({ createdAt: -1 });
    const total = await Blog.countDocuments();
    res.json({ success: true, data: posts, total });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

// POST create post (admin)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { title, excerpt, content, image, author, tags, readTime, isPublished } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    let slug = makeSlug(title);
    const existing = await Blog.findOne({ slug });
    if (existing) slug = slug + '-' + Date.now();
    const post = await Blog.create({
      title, slug, excerpt, content, image, author: author || "Amshine Team",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t=>t.trim()) : []),
      readTime: readTime || 3,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json({ success: true, data: post });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT update post (admin)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { title, excerpt, content, image, author, tags, readTime, isPublished } = req.body;
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    if (title && title !== post.title) {
      let slug = makeSlug(title);
      const existing = await Blog.findOne({ slug, _id: { $ne: post._id } });
      if (existing) slug = slug + '-' + Date.now();
      post.slug = slug;
    }
    if (title !== undefined) post.title = title;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (author !== undefined) post.author = author;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t=>t.trim());
    if (readTime !== undefined) post.readTime = readTime;
    if (isPublished !== undefined) {
      const wasPublished = post.isPublished;
      post.isPublished = !!isPublished;
      if (!wasPublished && !!isPublished) post.publishedAt = new Date();
    }
    await post.save();
    res.json({ success: true, data: post });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE post (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted" });
  } catch (e) { res.status(500).json({ success: false, message: "Server error" }); }
});

module.exports = router;
