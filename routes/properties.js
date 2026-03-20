// ============================================================
// FILE: routes/properties.js
// CRUD endpoints for Properties
// ============================================================

const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── GET /api/properties ─────────────────────────────────────
// Optional query params: status, locality_id, min_price, max_price,
//                        min_rent, max_rent, bedrooms, type
router.get("/", async (req, res) => {
  try {
    const { status, locality_id, min_price, max_price,
            min_rent, max_rent, bedrooms, type } = req.query;

    let sql = `
      SELECT p.*,
             l.locality_name, l.city, l.pincode,
             CONCAT(a.first_name,' ',a.last_name) AS listed_by_name
      FROM properties p
      JOIN localities l ON p.locality_id = l.locality_id
      JOIN agents     a ON p.listed_by_agent = a.agent_id
      WHERE 1=1
    `;
    const params = [];

    if (status)      { sql += " AND p.status = ?";                  params.push(status); }
    if (locality_id) { sql += " AND p.locality_id = ?";             params.push(locality_id); }
    if (min_price)   { sql += " AND p.selling_price >= ?";           params.push(min_price); }
    if (max_price)   { sql += " AND p.selling_price <= ?";           params.push(max_price); }
    if (min_rent)    { sql += " AND p.monthly_rent >= ?";            params.push(min_rent); }
    if (max_rent)    { sql += " AND p.monthly_rent <= ?";            params.push(max_rent); }
    if (bedrooms)    { sql += " AND p.num_bedrooms >= ?";            params.push(bedrooms); }
    if (type)        { sql += " AND p.property_type = ?";            params.push(type); }

    sql += " ORDER BY p.listing_date DESC";

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/properties/:id ─────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*,
              l.locality_name, l.city, l.pincode,
              CONCAT(a.first_name,' ',a.last_name) AS listed_by_name,
              a.phone AS agent_phone, a.email AS agent_email
       FROM properties p
       JOIN localities l ON p.locality_id = l.locality_id
       JOIN agents     a ON p.listed_by_agent = a.agent_id
       WHERE p.property_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Property not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/properties ────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      property_type, address_line, locality_id,
      selling_price, monthly_rent, size_sqft,
      num_bedrooms, year_constructed, listing_date,
      status = "Available", listed_by_agent,
    } = req.body;

    // Basic validation
    if (!property_type || !address_line || !locality_id || !selling_price ||
        !monthly_rent  || !size_sqft    || !num_bedrooms || !year_constructed ||
        !listing_date  || !listed_by_agent) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const [result] = await db.execute(
      `INSERT INTO properties
         (property_type, address_line, locality_id, selling_price, monthly_rent,
          size_sqft, num_bedrooms, year_constructed, listing_date, status, listed_by_agent)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [property_type, address_line, locality_id, selling_price, monthly_rent,
       size_sqft, num_bedrooms, year_constructed, listing_date, status, listed_by_agent]
    );
    res.status(201).json({ success: true, property_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/properties/:id ─────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const allowed = [
      "property_type","address_line","locality_id","selling_price",
      "monthly_rent","size_sqft","num_bedrooms","year_constructed",
      "listing_date","status","listed_by_agent",
    ];
    const fields  = [];
    const values  = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ success: false, error: "No fields to update" });

    values.push(req.params.id);
    const [result] = await db.execute(
      `UPDATE properties SET ${fields.join(", ")} WHERE property_id = ?`,
      values
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, error: "Property not found" });

    res.json({ success: true, message: "Property updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/properties/:id ──────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM properties WHERE property_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, error: "Property not found" });
    res.json({ success: true, message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
