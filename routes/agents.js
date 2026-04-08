// ============================================================
// FILE: routes/agents.js
// CRUD endpoints for Agents + per-agent stats
// ============================================================

const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── GET /api/agents ─────────────────────────────────────────
// router.get("/", async (_req, res) => {
//   try {
//     const [rows] = await db.execute(
//       `SELECT a.*,
//               COUNT(DISTINCT p.property_id)  AS total_listings,
//               COUNT(DISTINCT s.sale_id)      AS total_sales,
//               COUNT(DISTINCT r.rental_id)    AS total_rentals
//        FROM agents a
//        LEFT JOIN properties         p ON a.agent_id = p.listed_by_agent
//        LEFT JOIN sales_transactions  s ON a.agent_id = s.agent_id
//        LEFT JOIN rental_transactions r ON a.agent_id = r.agent_id
//        GROUP BY a.agent_id
//        ORDER BY total_sales DESC`
//     );
//     res.json({ success: true, count: rows.length, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     const { name, min_sales, min_rentals } = req.query;

//     let query = `
//       SELECT a.*, 
//              COUNT(DISTINCT s.sale_id) AS total_sales,
//              COUNT(DISTINCT r.rental_id) AS total_rentals
//       FROM agents a
//       LEFT JOIN sales_transactions s ON a.agent_id = s.agent_id
//       LEFT JOIN rental_transactions r ON a.agent_id = r.agent_id
//       WHERE 1=1
//     `;

//     const params = [];

//     if (name) {
//       query += " AND (a.first_name LIKE ? OR a.last_name LIKE ?)";
//       params.push(`%${name}%`, `%${name}%`);
//     }

//     query += " GROUP BY a.agent_id";

//     if (min_sales) {
//       query += " HAVING total_sales >= ?";
//       params.push(min_sales);
//     }

//     if (min_rentals) {
//       query += " AND total_rentals >= ?";
//       params.push(min_rentals);
//     }

//     const [rows] = await db.execute(query, params);
//     res.json({ success: true, data: rows });

//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ── GET /api/agents/:id ─────────────────────────────────────
// router.get("/:id", async (req, res) => {
//   try {
//     const [[agent]] = await db.execute(
//       "SELECT * FROM agents WHERE agent_id = ?", [req.params.id]
//     );
//     if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });

//     const [listings] = await db.execute(
//       `SELECT p.*, l.locality_name FROM properties p
//        JOIN localities l ON p.locality_id = l.locality_id
//        WHERE p.listed_by_agent = ?`, [req.params.id]
//     );

//     const [sales] = await db.execute(
//       `SELECT s.*, p.address_line,
//               FORMAT(s.sale_price/100000,2) AS price_lakhs
//        FROM sales_transactions s
//        JOIN properties p ON s.property_id = p.property_id
//        WHERE s.agent_id = ? ORDER BY s.sale_date DESC`, [req.params.id]
//     );

//     res.json({ success: true, data: { agent, listings, sales } });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


router.get("/", async (req, res) => {
  try {
    const { name, min_sales, min_rentals } = req.query;

    let query = `
      SELECT a.agent_id,
             a.first_name,
             a.last_name,
             a.email,
             a.phone,
             a.license_no,
             a.hire_date,
             COUNT(DISTINCT s.sale_id)   AS total_sales,
             COUNT(DISTINCT r.rental_id) AS total_rentals
      FROM agents a
      LEFT JOIN sales_transactions s ON a.agent_id = s.agent_id
      LEFT JOIN rental_transactions r ON a.agent_id = r.agent_id
    `;

    const conditions = [];
    const params = [];

    // 🔹 Name filter
    if (name) {
      conditions.push("(a.first_name LIKE ? OR a.last_name LIKE ?)");
      params.push(`%${name}%`, `%${name}%`);
    }

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY a.agent_id";

    // 🔹 HAVING filters (AFTER grouping)
    const having = [];

    if (min_sales) {
      having.push("total_sales >= ?");
      params.push(min_sales);
    }

    if (min_rentals) {
      having.push("total_rentals >= ?");
      params.push(min_rentals);
    }

    if (having.length) {
      query += " HAVING " + having.join(" AND ");
    }

    const [rows] = await db.execute(query, params);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/agents ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, phone, email, hire_date, license_no } = req.body;
    if (!first_name || !last_name || !phone || !email || !hire_date || !license_no)
      return res.status(400).json({ success: false, error: "All fields are required" });

    const [result] = await db.execute(
      `INSERT INTO agents (first_name, last_name, phone, email, hire_date, license_no)
       VALUES (?,?,?,?,?,?)`,
      [first_name, last_name, phone, email, hire_date, license_no]
    );
    res.status(201).json({ success: true, agent_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/agents/:id ─────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const allowed = ["first_name","last_name","phone","email","hire_date","license_no"];
    const fields  = [], values = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) { fields.push(`${key} = ?`); values.push(req.body[key]); }
    }
    if (!fields.length) return res.status(400).json({ success: false, error: "No fields to update" });
    values.push(req.params.id);
    const [result] = await db.execute(
      `UPDATE agents SET ${fields.join(", ")} WHERE agent_id = ?`, values
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, error: "Agent not found" });
    res.json({ success: true, message: "Agent updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
