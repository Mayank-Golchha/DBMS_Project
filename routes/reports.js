// ============================================================
// FILE: routes/reports.js
// All analytical / reporting endpoints (queries 1–6)
// ============================================================

const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── GET /api/reports/new-rentals
// Query 1: Properties built after 2023 and available for rent
router.get("/new-rentals", async (_req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.property_id, p.property_type, p.address_line,
             l.locality_name, l.city,
             p.year_constructed, p.monthly_rent,
             p.num_bedrooms, p.size_sqft
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      WHERE p.year_constructed > 2023
        AND p.status = 'Available'
      ORDER BY p.year_constructed DESC, p.monthly_rent`
    );
    res.json({ success: true, query: "Properties built after 2023 available for rent",
               count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/price-range?min=2000000&max=6000000
// Query 2: Houses/Apts in a selling price range
router.get("/price-range", async (req, res) => {
  try {
    const min = req.query.min || 2000000;   // default 20 L
    const max = req.query.max || 6000000;   // default 60 L
    const [rows] = await db.execute(`
      SELECT p.property_id, p.property_type, p.address_line,
             l.locality_name,
             FORMAT(p.selling_price/100000,2) AS price_lakhs,
             p.num_bedrooms, p.size_sqft, p.status
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      WHERE p.selling_price BETWEEN ? AND ?
      ORDER BY p.selling_price`,
      [min, max]
    );
    res.json({ success: true, query: `Price between ₹${min} and ₹${max}`,
               count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/rent-filter?locality=Andheri%20West&bedrooms=2&max_rent=15000
// Query 3: Rentals filtered by locality, bedrooms, rent cap
router.get("/rent-filter", async (req, res) => {
  try {
    const locality  = req.query.locality  || "Andheri West";
    const bedrooms  = req.query.bedrooms  || 2;
    const max_rent  = req.query.max_rent  || 15000;
    const [rows] = await db.execute(`
      SELECT p.property_id, p.property_type, p.address_line,
             l.locality_name, p.num_bedrooms,
             p.monthly_rent, p.size_sqft, p.year_constructed
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      WHERE l.locality_name = ?
        AND p.num_bedrooms  >= ?
        AND p.monthly_rent  <  ?
        AND p.status        = 'Available'
      ORDER BY p.monthly_rent`,
      [locality, bedrooms, max_rent]
    );
    res.json({ success: true,
               query: `Rental in ${locality}, ≥${bedrooms} BHK, rent < ₹${max_rent}`,
               count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/top-agent?year=2023
// Query 4: Agent with highest total sales in a given year
router.get("/top-agent", async (req, res) => {
  try {
    const year = req.query.year || 2023;
    const [rows] = await db.execute(`
      SELECT a.agent_id,
             CONCAT(a.first_name,' ',a.last_name) AS agent_name,
             a.email, a.phone,
             COUNT(s.sale_id)                     AS total_sales,
             SUM(s.sale_price)                    AS total_amount,
             FORMAT(SUM(s.sale_price)/100000,2)   AS amount_lakhs
      FROM sales_transactions s
      JOIN agents a ON s.agent_id = a.agent_id
      WHERE YEAR(s.sale_date) = ?
      GROUP BY a.agent_id
      ORDER BY total_amount DESC
      LIMIT 1`,
      [year]
    );
    res.json({ success: true, query: `Top selling agent in ${year}`,
               count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/agent-avg?year=2018
// Query 5: Per-agent avg selling price and avg days on market in a year
router.get("/agent-avg", async (req, res) => {
  try {
    const year = req.query.year || 2018;
    const [rows] = await db.execute(`
      SELECT a.agent_id,
             CONCAT(a.first_name,' ',a.last_name) AS agent_name,
             COUNT(s.sale_id)                     AS sales_count,
             FORMAT(AVG(s.sale_price)/100000,2)   AS avg_price_lakhs,
             ROUND(AVG(s.days_on_market),1)        AS avg_days_on_market
      FROM agents a
      LEFT JOIN sales_transactions s
             ON a.agent_id = s.agent_id
            AND YEAR(s.sale_date) = ?
      GROUP BY a.agent_id
      ORDER BY avg_price_lakhs DESC`,
      [year]
    );
    res.json({ success: true, query: `Agent averages for year ${year}`,
               count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/extremes
// Query 6: Most expensive and highest rent property
router.get("/extremes", async (_req, res) => {
  try {
    const [[expensive]] = await db.execute(`
      SELECT p.*, l.locality_name,
             FORMAT(p.selling_price/100000,2) AS price_lakhs
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      WHERE p.selling_price = (SELECT MAX(selling_price) FROM properties)`
    );
    const [[highest_rent]] = await db.execute(`
      SELECT p.*, l.locality_name
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      WHERE p.monthly_rent = (SELECT MAX(monthly_rent) FROM properties)`
    );
    res.json({ success: true,
               query: "Most expensive and highest rent properties",
               data: { most_expensive: expensive, highest_rent } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/reports/localities  (helper for frontend dropdowns)
router.get("/localities", async (_req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM localities ORDER BY locality_name");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
