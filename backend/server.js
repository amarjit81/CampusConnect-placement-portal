const express = require("express");
const connectDatabase = require("./config/database");
const opportunityRoutes = require("./routes/opportunityRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

// During development the React app runs on a different port from Express.
// These headers allow the browser to call this API from the Vite frontend.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// This lets Express read JSON data sent in POST and PUT requests.
app.use(express.json());

// A small home route to confirm that the backend is running.
app.get("/", (req, res) => {
  res.status(200).json({ message: "CampusConnect backend is running" });
});

// API routes for opportunities and announcements.
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/announcements", announcementRoutes);

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

startServer();
