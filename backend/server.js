const express = require("express");
const helmet = require("helmet");
const { ipKeyGenerator, rateLimit } = require("express-rate-limit");
const connectDatabase = require("./config/database");
const opportunityRoutes = require("./routes/opportunityRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const announcementReadRoutes = require("./routes/announcementReadRoutes");
const authRoutes = require("./routes/authRoutes");
const { authenticate } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());

// During development the React app runs on a different port from Express.
// These headers allow the browser to call this API from the Vite frontend.
app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// This lets Express read JSON data sent in POST and PUT requests.
app.use(express.json({ limit: "100kb" }));

// A small home route to confirm that the backend is running.
app.get("/", (req, res) => {
  res.status(200).json({ message: "CampusConnect backend is running" });
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please try again later." },
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", authenticate, opportunityRoutes);
app.use("/api/announcements", authenticate, announcementRoutes);
app.use("/api/events", authenticate, eventRoutes);
app.use("/api/bookmarks", authenticate, bookmarkRoutes);
app.use("/api/applications", authenticate, applicationRoutes);
app.use("/api/profile", authenticate, profileRoutes);
app.use("/api/announcement-reads", authenticate, announcementReadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled API error:", error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server could not start:", error.message);
    process.exit(1);
  }
}

if (require.main === module) startServer();

module.exports = { app, startServer };
