
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to PostgreSQL using the Render DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

// Create the reports table if it doesn't exist
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      company TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      "createdAt" TEXT NOT NULL
    );
  `);

  console.log("PostgreSQL database connected successfully.");
}

// Health check
app.get("/", (req, res) => {
  res.json({ message: "InternSafe-AI backend is running!" });
});

// Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reports ORDER BY id DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reports:", error.message);
    res.status(500).json({ message: "Failed to fetch reports." });
  }
});

// Create a report
app.post("/api/reports", async (req, res) => {
  const { company, description, category } = req.body || {};

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

    const result = await pool.query(
      `INSERT INTO reports
       (company, description, category, "createdAt")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        company.trim(),
        description.trim(),
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Other",
        createdAt,
      ]
    );

    res.status(201).json({
      message: "Report saved successfully!",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving report:", error.message);
    res.status(500).json({ message: "Failed to save report." });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Handle request errors
app.use((error, req, res, next) => {
  console.error("Request error:", error.message);

  if (res.headersSent) return next(error);

  if (error.status === 400 || error instanceof SyntaxError) {
    return res.status(400).json({ message: "Invalid JSON request." });
  }

  res.status(500).json({ message: "Internal server error." });
});

// Start only after the database is ready
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`InternSafe-AI backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
async function shutdown() {
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
