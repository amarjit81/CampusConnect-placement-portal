const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { getJwtSecret } = require("../controllers/authController");

async function authenticate(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: "campusconnect",
    });
    const user = await User.findOne({ _id: payload.sub, isActive: true }).select(
      "_id name email role isActive",
    );

    if (!user) {
      return res.status(401).json({ message: "Account is unavailable" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Session is invalid or expired" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
