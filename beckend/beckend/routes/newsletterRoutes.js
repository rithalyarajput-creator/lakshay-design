const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, admin } = require("../middleware/auth");

// ── Inline Newsletter Schema ──────────────────────────────────
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);

// POST /api/newsletter/subscribe  (public)
router.post("/subscribe", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }
  try {
    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return res.json({ success: true, message: "You've been re-subscribed!" });
      }
      return res.json({ success: true, message: "You're already subscribed!" });
    }
    await Newsletter.create({ email: email.toLowerCase().trim(), name: name || "" });
    res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Something went wrong. Try again!" });
  }
});

// GET /api/newsletter/subscribers  (admin only)
router.get("/subscribers", protect, admin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ success: true, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/newsletter/subscribers/:id  (admin only)
router.delete("/subscribers/:id", protect, admin, async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Subscriber removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
