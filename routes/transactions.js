// ============================================================
// FILE: routes/transactions.js
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all transactions (sales + rentals)
router.get("/", async (_req, res) => {
  try {
    const [sales] = await db.execute(`
      SELECT 'Sale' AS type, s.sale_id AS id,
             p.address_line,
             CONCAT(c.first_name,' ',c.last_name) AS client,
             CONCAT(a.first_name,' ',a.last_name) AS agent,
             s.sale_price AS amount,
             s.sale_date AS date
      FROM sales_transactions s
      JOIN properties p ON s.property_id = p.property_id
      JOIN clients c ON s.buyer_id = c.client_id
      JOIN agents a ON s.agent_id = a.agent_id
    `);

    const [rentals] = await db.execute(`
      SELECT 'Rent' AS type, r.rental_id AS id,
             p.address_line,
             CONCAT(c.first_name,' ',c.last_name) AS client,
             CONCAT(a.first_name,' ',a.last_name) AS agent,
             r.monthly_rent AS amount,
             r.start_date AS date
      FROM rental_transactions r
      JOIN properties p ON r.property_id = p.property_id
      JOIN clients c ON r.tenant_id = c.client_id
      JOIN agents a ON r.agent_id = a.agent_id
    `);

    res.json({ success: true, data: [...sales, ...rentals] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ADD SALE
router.post("/sale", async (req, res) => {
  try {
    const { property_id, agent_id, buyer_id, seller_id, price, date } = req.body;

    await db.execute(
      `INSERT INTO sales_transactions
       (property_id, agent_id, buyer_id, seller_id, sale_price, sale_date, days_on_market)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [property_id, agent_id, buyer_id, seller_id, price, date]
    );

    await db.execute(
      `UPDATE properties SET status = 'Sold' WHERE property_id = ?`,
      [property_id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;