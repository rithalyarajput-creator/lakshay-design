const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  title:       { type: String },
  content:     { type: String, default: '' },
  contactInfo: { type: mongoose.Schema.Types.Mixed },
  updatedAt:   { type: Date, default: Date.now },
});
const CmsPage = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsSchema);

// GET /api/cms/:slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await CmsPage.findOne({ slug: req.params.slug });
    if (!page) return res.json({ success: true, data: { slug: req.params.slug, content: '', contactInfo: null } });
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cms/:slug  (admin save)
router.post('/:slug', async (req, res) => {
  try {
    const { content, title, contactInfo } = req.body;
    const update = { updatedAt: new Date() };
    if (content !== undefined) update.content = content;
    if (title)       update.title = title;
    if (contactInfo) update.contactInfo = contactInfo;

    const page = await CmsPage.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: update },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
