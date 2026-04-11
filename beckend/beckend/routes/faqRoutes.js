const express = require("express");
const router = express.Router();
const getPool = require("../config/mysql");
const { getAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faqController");
const { protect, admin } = require("../middleware/auth");

router.get("/", getAllFaqs);

// Public: FAQs to show on homepage
router.get("/active", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM faqs WHERE isActive = 1 AND showOnHome = 1 ORDER BY sortOrder ASC"
    );
    const fmt = (row) => ({
      _id: row.id, id: row.id,
      question: row.question, answer: row.answer,
      isActive: !!row.isActive, showOnHome: !!row.showOnHome,
      order: row.sortOrder, createdAt: row.createdAt,
    });
    res.json({ success: true, faqs: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post("/", protect, admin, createFaq);
router.put("/:id", protect, admin, updateFaq);
router.delete("/:id", protect, admin, deleteFaq);

module.exports = router;
