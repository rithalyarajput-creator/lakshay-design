const express = require("express");
const router = express.Router();
const getPool = require("../config/mysql");
const { protect, admin } = require("../middleware/auth");

router.get("/", protect, admin, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, role, phone, createdAt FROM users ORDER BY createdAt DESC"
    );
    const fmt = (u) => ({ ...u, _id: u.id, createdAt: u.created_at });
    res.json({ success: true, data: rows.map(fmt), total: rows.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
