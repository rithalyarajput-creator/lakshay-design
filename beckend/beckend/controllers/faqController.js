const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  question: row.question, answer: row.answer,
  isActive: !!row.isActive,
  showOnHome: !!row.showOnHome,
  order: row.sortOrder,
  sortOrder: row.sortOrder,
  createdAt: row.createdAt,
} : null;

const getAllFaqs = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM faqs ORDER BY sortOrder ASC, createdAt DESC");
    res.json({ success: true, faqs: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createFaq = async (req, res) => {
  try {
    const { question, answer, isActive, showOnHome, order } = req.body;
    if (!question || !answer) return res.status(400).json({ success: false, message: "Question and answer required." });
    const pool = getPool();
    const id = newId();
    await pool.query(
      "INSERT INTO faqs (id, question, answer, isActive, showOnHome, sortOrder) VALUES (?, ?, ?, ?, ?, ?)",
      [id, question, answer, isActive !== false ? 1 : 0, showOnHome ? 1 : 0, order || 0]
    );
    const [rows] = await pool.query("SELECT * FROM faqs WHERE id = ?", [id]);
    res.status(201).json({ success: true, faq: fmt(rows[0]) });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const updateFaq = async (req, res) => {
  try {
    const pool = getPool();
    const fields = [];
    const vals = [];
    if (req.body.question !== undefined) { fields.push("question = ?"); vals.push(req.body.question); }
    if (req.body.answer !== undefined) { fields.push("answer = ?"); vals.push(req.body.answer); }
    if (req.body.isActive !== undefined) { fields.push("isActive = ?"); vals.push(req.body.isActive ? 1 : 0); }
    if (req.body.showOnHome !== undefined) { fields.push("showOnHome = ?"); vals.push(req.body.showOnHome ? 1 : 0); }
    if (req.body.order !== undefined) { fields.push("sortOrder = ?"); vals.push(req.body.order); }
    if (req.body.sortOrder !== undefined) { fields.push("sortOrder = ?"); vals.push(req.body.sortOrder); }
    if (!fields.length) return res.status(400).json({ success: false, message: "Nothing to update." });
    vals.push(req.params.id);
    await pool.query(`UPDATE faqs SET ${fields.join(", ")} WHERE id = ?`, vals);
    const [rows] = await pool.query("SELECT * FROM faqs WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, faq: fmt(rows[0]) });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const deleteFaq = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM faqs WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "FAQ deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAllFaqs, createFaq, updateFaq, deleteFaq };
