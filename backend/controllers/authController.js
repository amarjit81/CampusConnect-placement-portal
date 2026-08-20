const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

function serializeUser(user) {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }
  return "campusconnect-development-secret-change-me";
}

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !validPassword || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { sub: String(user._id), role: user.role },
      getJwtSecret(),
      { expiresIn: "8h", issuer: "campusconnect" },
    );

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Unable to sign in" });
  }
}

function getCurrentUser(req, res) {
  return res.status(200).json({ user: serializeUser(req.user) });
}

module.exports = { login, getCurrentUser, getJwtSecret, serializeUser };
