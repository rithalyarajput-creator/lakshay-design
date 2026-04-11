const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  name: row.name, slug: row.slug,
  image: row.image, description: row.description,
  isActive: !!row.isActive, createdAt: row.createdAt,
} : null;

const getCategories = async (req, res) => {
  try {
    const pool = getPool();
    const showAll = req.query.all === "true";
    const sql = showAll
      ? "SELECT * FROM categories ORDER BY name ASC"
      : "SELECT * FROM categories WHERE isActive = 1 ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    res.status(200).json({ success: true, data: rows.map(fmt) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });
    const pool = getPool();
    const id = newId();
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await pool.query(
      "INSERT INTO categories (id, name, slug, image, description, isActive) VALUES (?, ?, ?, ?, ?, 1)",
      [id, name.trim(), slug, image || "", description || ""]
    );
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    res.status(201).json({ success: true, data: fmt(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Category with this name already exists." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, image, description, isActive } = req.body;
    const pool = getPool();
    const fields = [];
    const vals = [];
    if (name !== undefined) { fields.push("name = ?"); vals.push(name.trim()); }
    if (image !== undefined) { fields.push("image = ?"); vals.push(image); }
    if (description !== undefined) { fields.push("description = ?"); vals.push(description); }
    if (isActive !== undefined) { fields.push("isActive = ?"); vals.push(isActive ? 1 : 0); }
    if (!fields.length) return res.status(400).json({ success: false, message: "Nothing to update." });
    vals.push(req.params.id);
    await pool.query(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, vals);
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Category not found." });
    res.status(200).json({ success: true, data: fmt(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("UPDATE categories SET isActive = 0 WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const imagePath = `/uploads/${req.file.filename}`;
    const pool = getPool();
    await pool.query("UPDATE categories SET image = ? WHERE id = ?", [imagePath, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Category not found." });
    res.status(200).json({ success: true, data: fmt(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage };
