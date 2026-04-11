const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const fmt = (row) => row ? {
  _id: row.id, id: row.id,
  code: row.code, type: row.type, value: parseFloat(row.value) || 0,
  minOrder: parseFloat(row.minOrder) || 0,
  maxDiscount: row.maxDiscount ? parseFloat(row.maxDiscount) : null,
  totalLimit: row.usageLimit || null,
  usageLimit: row.usageLimit,
  usedCount: row.usedCount || 0,
  isActive: !!row.isActive,
  endDate: row.expiresAt,
  expiresAt: row.expiresAt,
  description: row.description || "",
  createdAt: row.createdAt,
} : null;

const getAllCoupons = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM coupons ORDER BY createdAt DESC");
    res.json({ success: true, data: rows.map(fmt) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createCoupon = async (req, res) => {
  try {
    const { code, description, type, value, minOrder, maxDiscount, totalLimit, usageLimit, expiresAt, endDate, isActive } = req.body;
    if (!code || !value) return res.status(400).json({ success: false, message: "Code and value required." });
    const pool = getPool();
    const id = newId();
    const limit = totalLimit || usageLimit || null;
    const expiry = expiresAt || endDate || null;
    await pool.query(
      `INSERT INTO coupons (id, code, description, type, value, minOrder, maxDiscount, usageLimit, expiresAt, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, code.toUpperCase().trim(), description || "",
        type || "percentage", value,
        minOrder || 0, maxDiscount || null,
        limit, expiry, isActive !== false ? 1 : 0
      ]
    );
    const [rows] = await pool.query("SELECT * FROM coupons WHERE id = ?", [id]);
    res.status(201).json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const updateCoupon = async (req, res) => {
  try {
    const pool = getPool();
    const fields = [];
    const vals = [];
    if (req.body.code !== undefined) { fields.push("code = ?"); vals.push(req.body.code.toUpperCase().trim()); }
    if (req.body.description !== undefined) { fields.push("description = ?"); vals.push(req.body.description); }
    if (req.body.type !== undefined) { fields.push("type = ?"); vals.push(req.body.type); }
    if (req.body.value !== undefined) { fields.push("value = ?"); vals.push(req.body.value); }
    if (req.body.minOrder !== undefined) { fields.push("minOrder = ?"); vals.push(req.body.minOrder || 0); }
    if (req.body.maxDiscount !== undefined) { fields.push("maxDiscount = ?"); vals.push(req.body.maxDiscount || null); }
    const limit = req.body.totalLimit || req.body.usageLimit;
    if (limit !== undefined) { fields.push("usageLimit = ?"); vals.push(limit || null); }
    const expiry = req.body.expiresAt || req.body.endDate;
    if (expiry !== undefined) { fields.push("expiresAt = ?"); vals.push(expiry || null); }
    if (req.body.isActive !== undefined) { fields.push("isActive = ?"); vals.push(req.body.isActive ? 1 : 0); }
    if (!fields.length) return res.status(400).json({ success: false, message: "Nothing to update." });
    vals.push(req.params.id);
    await pool.query(`UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`, vals);
    const [rows] = await pool.query("SELECT * FROM coupons WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: fmt(rows[0]) });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

const deleteCoupon = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Coupon code required" });
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM coupons WHERE code = ? AND isActive = 1",
      [code.toUpperCase().trim()]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    const coupon = rows[0];
    const now = new Date();
    if (coupon.expiresAt && now > new Date(coupon.expiresAt))
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    if (coupon.minOrder && orderAmount < parseFloat(coupon.minOrder))
      return res.status(400).json({ success: false, message: `Min order Rs.${coupon.minOrder} required` });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });

    let discount = 0;
    const amt = parseFloat(orderAmount) || 0;
    const val = parseFloat(coupon.value) || 0;
    if (coupon.type === "percentage") {
      discount = Math.round((amt * val) / 100);
      if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) discount = parseFloat(coupon.maxDiscount);
    } else {
      discount = val;
    }
    if (discount > amt) discount = amt;

    res.json({
      success: true,
      data: {
        code: coupon.code, description: coupon.description || "",
        type: coupon.type, value: val,
        discount, finalAmount: amt - discount,
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
