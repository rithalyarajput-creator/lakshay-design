const express = require("express");
const router = express.Router();
const getPool = require("../config/mysql");
const { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require("../controllers/couponController");
const { protect, admin } = require("../middleware/auth");

// POST /api/coupons/validate — public
router.post("/validate", validateCoupon);

// GET /api/coupons/active — public
router.get("/active", async (req, res) => {
  try {
    const pool = getPool();
    const now = new Date();
    const [rows] = await pool.query(
      "SELECT code, description, type, value, minOrder, maxDiscount, usageLimit, usedCount, expiresAt FROM coupons WHERE isActive = 1 AND (expiresAt IS NULL OR expiresAt >= ?)",
      [now]
    );
    const fmt = (r) => ({
      _id: r.id, code: r.code, description: r.description || "",
      type: r.type, value: parseFloat(r.value) || 0,
      minOrder: parseFloat(r.minOrder) || 0,
      maxDiscount: r.maxDiscount ? parseFloat(r.maxDiscount) : null,
      totalLimit: r.usageLimit, usedCount: r.usedCount || 0, endDate: r.expiresAt,
    });
    res.json({ success: true, data: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get("/", protect, admin, getAllCoupons);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
