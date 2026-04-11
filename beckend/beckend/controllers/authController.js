const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const getPool = require("../config/mysql");

const newId = () => crypto.randomBytes(12).toString("hex");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email and password." });
    }
    const pool = getPool();
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const id = newId();
    await pool.query(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'user')",
      [id, name.trim(), email.toLowerCase().trim(), hashed]
    );
    const token = generateToken(id);
    res.status(201).json({
      success: true,
      token,
      data: { _id: id, name: name.trim(), email: email.toLowerCase().trim(), role: "user" }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const token = generateToken(user.id);
    res.status(200).json({
      success: true,
      token,
      data: { _id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, email, role, phone, isActive, createdAt FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found." });
    const u = rows[0];
    res.status(200).json({ success: true, data: { _id: u.id, ...u } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully. Please remove token from client." });
};

module.exports = { register, login, getMe, logout };
