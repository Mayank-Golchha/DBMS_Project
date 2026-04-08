// ============================================================
// FILE: server.js
// Express application entry point
// ============================================================

require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const path       = require("path");

const propertiesRouter = require("./routes/properties");
const agentsRouter     = require("./routes/agents");
const reportsRouter    = require("./routes/reports");
const clientsRouter      = require("./routes/clients");
const transactionsRouter = require("./routes/transactions");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ─────────────────────────────────────────────
app.use("/api/properties", propertiesRouter);
app.use("/api/agents",     agentsRouter);
app.use("/api/reports",    reportsRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/transactions", transactionsRouter);

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ── Fallback: serve frontend for any non-API route ─────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});

module.exports = app;
