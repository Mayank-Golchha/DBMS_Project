// ============================================================
// FILE: routes/clients.js
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all clients
// router.get("/", async (_req, res) => {
//   try {
//     const [rows] = await db.execute(
//       `SELECT client_id, first_name, last_name, phone, email, client_type
//        FROM clients ORDER BY client_id DESC`
//     );
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


router.get("/", async (req, res) => {
  try {
    const { type, min_budget, max_budget, location } = req.query;

    let query = `SELECT * FROM clients WHERE 1=1`;
    const params = [];

    if (type) {
      query += " AND client_type = ?";
      params.push(type);
    }

    if (min_budget) {
      query += " AND budget >= ?";
      params.push(min_budget);
    }

    if (max_budget) {
      query += " AND budget <= ?";
      params.push(max_budget);
    }

    if (location) {
      query += " AND preferred_location LIKE ?";
      params.push(`%${location}%`);
    }

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new client
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, phone, email, client_type } = req.body;

    const [result] = await db.execute(
      `INSERT INTO clients (first_name, last_name, phone, email, client_type)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, phone, email, client_type]
    );

    res.json({ success: true, client_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE client
router.delete("/:id", async (req, res) => {
  try {
    await db.execute(`DELETE FROM clients WHERE client_id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;