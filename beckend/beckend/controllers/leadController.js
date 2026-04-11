const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");
const fmt = (row) => row ? { _id: row.id, id: row.id, ...row, createdAt: row.createdAt } : null;

const createLead = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }
    const pool = getPool();
    const id = newId();
    await pool.query(
      "INSERT INTO leads (id, name, email, phone, message, status) VALUES (?, ?, ?, ?, ?, 'new')",
      [id, name, email, phone || "", message]
    );
    const [rows] = await pool.query("SELECT * FROM leads WHERE id = ?", [id]);
    res.status(201).json({ success: true, message: "Message received!", lead: fmt(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllLeads = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM leads ORDER BY createdAt DESC");
    res.json({ success: true, leads: rows.map(fmt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("UPDATE leads SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true, lead: fmt(rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM leads WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Lead deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createLead, getAllLeads, updateLeadStatus, deleteLead };
