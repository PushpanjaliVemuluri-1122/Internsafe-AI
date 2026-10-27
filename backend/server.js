const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database in the same folder as server.js
const dbPath = path.join(__dirname, "internsafe.db");
const db = new Database(dbPath);

// Create table only if it does not already exist.
// Existing records will not be deleted.
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    createdAt TEXT NOT NULL
  );
`);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "InternSafe-AI backend is running!",
  });
});

// Get all reports
app.get("/api/reports", (req, res) => {
  try {
    const reports = db
      .prepare("SELECT * FROM reports ORDER BY id DESC")
      .all();

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);

    return res.status(500).json({
      message: "Failed to fetch reports.",
    });
  }
});

// Create a report
app.post("/api/reports", (req, res) => {
  const { company, description, category } = req.body || {};

  // Validate required fields
  if (
    typeof company !== "string" ||
    !company.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return res.status(400).json({
      message: "Company and description are required.",
    });
  }

  try {
    const createdAt = new Date().toISOString();

    const insertReport = db.prepare(`
      INSERT INTO reports (
        company,
        description,
        category,
        createdAt
      )
      VALUES (?, ?, ?, ?)
    `);

    const result = insertReport.run(
      company.trim(),
      description.trim(),
      typeof category === "string" && category.trim()
        ? category.trim()
        : "Other",
      createdAt
    );

    // Return the newly saved report
    const report = db
      .prepare("SELECT * FROM reports WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: "Report saved successfully!",
      report,
    });
  } catch (error) {
    console.error("Error saving report:", error);

    return res.status(500).json({
      message: "Failed to save report.",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found.",
  });
});

// Handle invalid JSON and other request errors
app.use((error, req, res, next) => {
  console.error("Request error:", error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.status === 400 || error instanceof SyntaxError) {
    return res.status(400).json({
      message: "Invalid JSON request.",
    });
  }

  return res.status(500).json({
    message: "Internal server error.",
  });
});

// Start backend
const server = app.listen(PORT, () => {
  console.log(`InternSafe-AI backend running at http://localhost:${PORT}`);
  console.log(`SQLite database: ${dbPath}`);
});

// Graceful shutdown
function shutdown() {
  server.close(() => {
    if (db.open) {
      db.close();
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
