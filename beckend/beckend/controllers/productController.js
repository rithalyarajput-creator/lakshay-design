const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const parseJSON = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

// Build full product object with images joined from product_images table
const buildProduct = async (pool, row) => {
  if (!row) return null;
  const [imgs] = await pool.query(
    "SELECT url, isPrimary FROM product_images WHERE product_id = ? ORDER BY isPrimary DESC",
    [row.id]
  );
  const images = imgs.map(i => i.url);
  return {
    _id: row.id, id: row.id,
    title: row.title,
    description: row.description,
    price: parseFloat(row.price) || 0,
    comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
    salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
    category: row.category_id ? [row.category_id] : [],
    category_id: row.category_id,
    stock: row.stock || 0,
    sku: row.sku,
    isFeatured: !!row.isFeatured,
    isActive: !!row.isActive,
    tags: parseJSON(row.tags, []),
    images,
    createdAt: row.createdAt,
  };
};

const getAllProducts = async (req, res) => {
  try {
    const pool = getPool();
    const conditions = [];
    const vals = [];

    const activeParam = req.query.isActive;
    if (!activeParam || activeParam === "true") {
      conditions.push("isActive = 1");
    } else if (activeParam === "false") {
      conditions.push("isActive = 0");
    }

    if (req.query.category) {
      conditions.push("(category_id = ? OR category_id LIKE ?)");
      vals.push(req.query.category, `%${req.query.category}%`);
    }
    if (req.query.search) {
      conditions.push("title LIKE ?");
      vals.push(`%${req.query.search}%`);
    }
    if (req.query.featured === "true") conditions.push("isFeatured = 1");

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM products ${where}`, vals);
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset]
    );

    const data = await Promise.all(rows.map(r => buildProduct(pool, r)));
    res.status(200).json({ success: true, data, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: await buildProduct(pool, rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const pool = getPool();
    const {
      title, description, price, comparePrice, salePrice,
      category, stock, sku, isFeatured, isActive, tags, images
    } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Product title is required." });
    if (!price) return res.status(400).json({ success: false, message: "Product price is required." });

    const id = newId();
    const categoryId = Array.isArray(category) ? (category[0] || null) : (category || null);

    await pool.query(
      `INSERT INTO products (id, title, description, price, comparePrice, salePrice, category_id, stock, sku, isFeatured, isActive, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, description || "", price,
        comparePrice || null, salePrice || null,
        categoryId, stock || 0, sku || null,
        isFeatured ? 1 : 0,
        isActive !== false ? 1 : 0,
        tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : null
      ]
    );

    // Insert images into product_images table
    if (images && images.length) {
      const imgList = Array.isArray(images) ? images : [images];
      for (let i = 0; i < imgList.length; i++) {
        await pool.query(
          "INSERT INTO product_images (product_id, url, isPrimary) VALUES (?, ?, ?)",
          [id, imgList[i], i === 0 ? 1 : 0]
        );
      }
    }

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    res.status(201).json({ success: true, data: await buildProduct(pool, rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const pool = getPool();
    const fields = [];
    const vals = [];
    const simple = { title: "title", description: "description", price: "price", comparePrice: "comparePrice", salePrice: "salePrice", stock: "stock", sku: "sku" };
    for (const [k, col] of Object.entries(simple)) {
      if (req.body[k] !== undefined) { fields.push(`${col} = ?`); vals.push(req.body[k]); }
    }
    if (req.body.isFeatured !== undefined) { fields.push("isFeatured = ?"); vals.push(req.body.isFeatured ? 1 : 0); }
    if (req.body.isActive !== undefined) { fields.push("isActive = ?"); vals.push(req.body.isActive ? 1 : 0); }
    if (req.body.category !== undefined) {
      const cat = Array.isArray(req.body.category) ? req.body.category[0] : req.body.category;
      fields.push("category_id = ?"); vals.push(cat || null);
    }
    if (req.body.tags !== undefined) {
      const t = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      fields.push("tags = ?"); vals.push(JSON.stringify(t));
    }
    if (req.body.images !== undefined) {
      const imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      await pool.query("DELETE FROM product_images WHERE product_id = ?", [req.params.id]);
      for (let i = 0; i < imgs.length; i++) {
        await pool.query("INSERT INTO product_images (product_id, url, isPrimary) VALUES (?, ?, ?)", [req.params.id, imgs[i], i === 0 ? 1 : 0]);
      }
    }
    if (fields.length) {
      vals.push(req.params.id);
      await pool.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, vals);
    }
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: await buildProduct(pool, rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("UPDATE products SET isActive = 0 WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }
    const pool = getPool();
    const [rows] = await pool.query("SELECT id FROM products WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Product not found." });
    for (const f of req.files) {
      await pool.query("INSERT INTO product_images (product_id, url, isPrimary) VALUES (?, ?, 0)", [req.params.id, `/uploads/${f.filename}`]);
    }
    const [updated] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.status(200).json({ success: true, data: await buildProduct(pool, updated[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImages };
