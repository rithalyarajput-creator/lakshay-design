const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const parseJSON = (val, fallback) => {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const fmtOrder = (order, items) => {
  const shippingAddress = {
    name: order.ship_name || "",
    phone: order.ship_phone || "",
    address: order.ship_address || "",
    city: order.ship_city || "",
    state: order.ship_state || "",
    pincode: order.ship_pincode || "",
  };
  return {
    _id: order.id, id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: parseFloat(order.subtotal) || 0,
    shipping: parseFloat(order.shipping) || 0,
    discount: parseFloat(order.discount) || 0,
    totalAmount: parseFloat(order.total) || 0,
    total: parseFloat(order.total) || 0,
    coupon: order.coupon_code,
    notes: order.notes,
    shippingAddress,
    createdAt: order.createdAt,
    user: order.user_id ? { _id: order.user_id, name: order.user_name || "", email: order.user_email || "" } : null,
    items: (items || []).map(i => ({
      _id: i.id,
      quantity: i.quantity,
      price: parseFloat(i.price) || 0,
      product: {
        _id: i.product_id,
        title: i.product_title || "",
        price: parseFloat(i.price) || 0,
        images: [],
      }
    }))
  };
};

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, coupon, discount } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "No order items provided." });
    }
    const pool = getPool();
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const pid = item.product || item._id || item.productId || item.id;
      const [prows] = await pool.query("SELECT id, title, price, stock FROM products WHERE id = ?", [pid]);
      if (!prows.length) {
        return res.status(404).json({ success: false, message: `Product ${pid} not found.` });
      }
      const product = prows[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}.` });
      }
      orderItems.push({ product_id: product.id, product_title: product.title, quantity: item.quantity, price: parseFloat(product.price) });
      subtotal += parseFloat(product.price) * item.quantity;
      await pool.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, product.id]);
    }

    const disc = parseFloat(discount) || 0;
    const total = subtotal - disc;
    const addr = shippingAddress || {};
    const id = newId();

    await pool.query(
      `INSERT INTO orders (id, user_id, status, paymentMethod, subtotal, discount, total, coupon_code,
        ship_name, ship_phone, ship_address, ship_city, ship_state, ship_pincode)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, req.user.id,
        paymentMethod || "COD",
        subtotal, disc, total,
        coupon || null,
        addr.name || "", addr.phone || "", addr.address || "",
        addr.city || "", addr.state || "", addr.pincode || ""
      ]
    );

    for (const oi of orderItems) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [id, oi.product_id, oi.product_title, oi.quantity, oi.price]
      );
    }

    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    const [oitems] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [id]);
    res.status(201).json({ success: true, data: fmtOrder(orders[0], oitems) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const pool = getPool();
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY createdAt DESC",
      [req.user.id]
    );
    const result = [];
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      result.push(fmtOrder(order, items));
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const pool = getPool();
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.createdAt DESC`
    );
    const result = [];
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      result.push(fmtOrder(order, items));
    }
    res.status(200).json({ success: true, data: { orders: result, total: result.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const pool = getPool();
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: "Order not found." });
    const order = orders[0];
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this order." });
    }
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    res.status(200).json({ success: true, data: fmtOrder(order, items) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }
    const pool = getPool();
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: "Order not found." });
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
    res.status(200).json({ success: true, data: fmtOrder(orders[0], items) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrderStatus };
