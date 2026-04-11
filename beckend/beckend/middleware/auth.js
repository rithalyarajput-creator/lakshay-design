const jwt = require("jsonwebtoken");
const getPool = require("../config/mysql");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = getPool();
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Not authorized. User no longer exists." });
    }
    req.user = { ...rows[0], _id: rows[0].id };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized. Token is invalid or expired." });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Access denied. Admins only." });
};

module.exports = { protect, admin };
