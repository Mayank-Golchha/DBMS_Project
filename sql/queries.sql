-- ============================================================
-- FILE: sql/queries.sql
-- Real Estate Office DBMS - All Required Queries
-- ============================================================

USE real_estate_db;

-- ------------------------------------------------------------
-- QUERY 1: Properties built after 2023 and available for rent
-- ------------------------------------------------------------
SELECT
    p.property_id,
    p.property_type,
    p.address_line,
    l.locality_name,
    p.year_constructed,
    p.monthly_rent,
    p.num_bedrooms,
    p.size_sqft
FROM properties p
JOIN localities l ON p.locality_id = l.locality_id
WHERE p.year_constructed > 2023
  AND p.status = 'Available'
ORDER BY p.year_constructed DESC, p.monthly_rent;

-- ------------------------------------------------------------
-- QUERY 2: Houses with selling price between 20L and 60L (2000000 – 6000000 INR)
-- ------------------------------------------------------------
SELECT
    p.property_id,
    p.property_type,
    p.address_line,
    l.locality_name,
    FORMAT(p.selling_price / 100000, 2) AS selling_price_lakhs,
    p.num_bedrooms,
    p.size_sqft,
    p.status
FROM properties p
JOIN localities l ON p.locality_id = l.locality_id
WHERE p.selling_price BETWEEN 2000000 AND 6000000
ORDER BY p.selling_price;

-- ------------------------------------------------------------
-- QUERY 3: Properties for rent in a specific locality
--          with ≥2 bedrooms and rent < 15000
-- (parameterised as 'Andheri West'; change locality_name to filter)
-- ------------------------------------------------------------
SELECT
    p.property_id,
    p.property_type,
    p.address_line,
    l.locality_name,
    p.num_bedrooms,
    p.monthly_rent,
    p.size_sqft,
    p.year_constructed
FROM properties p
JOIN localities l ON p.locality_id = l.locality_id
WHERE l.locality_name = 'Andheri West'   -- change locality here
  AND p.num_bedrooms  >= 2
  AND p.monthly_rent  <  15000
  AND p.status        = 'Available'
ORDER BY p.monthly_rent;

-- ------------------------------------------------------------
-- QUERY 4: Agent who sold the most property in 2023 (by total amount)
-- ------------------------------------------------------------
SELECT
    a.agent_id,
    CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
    a.email,
    COUNT(s.sale_id)             AS total_sales_count,
    SUM(s.sale_price)            AS total_sale_amount,
    FORMAT(SUM(s.sale_price) / 100000, 2) AS amount_in_lakhs
FROM sales_transactions s
JOIN agents a ON s.agent_id = a.agent_id
WHERE YEAR(s.sale_date) = 2023
GROUP BY a.agent_id, a.first_name, a.last_name, a.email
ORDER BY total_sale_amount DESC
LIMIT 1;

-- ------------------------------------------------------------
-- QUERY 5: For each agent — avg selling price & avg time on market (2018)
-- ------------------------------------------------------------
SELECT
    a.agent_id,
    CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
    COUNT(s.sale_id)                       AS sales_in_2018,
    FORMAT(AVG(s.sale_price) / 100000, 2) AS avg_sale_price_lakhs,
    ROUND(AVG(s.days_on_market), 1)        AS avg_days_on_market
FROM agents a
LEFT JOIN sales_transactions s
       ON a.agent_id = s.agent_id
      AND YEAR(s.sale_date) = 2018
GROUP BY a.agent_id, a.first_name, a.last_name
ORDER BY avg_sale_price_lakhs DESC;

-- ------------------------------------------------------------
-- QUERY 6A: Most expensive property (by selling price)
-- ------------------------------------------------------------
SELECT
    p.property_id,
    p.property_type,
    p.address_line,
    l.locality_name,
    p.selling_price,
    FORMAT(p.selling_price / 100000, 2) AS price_lakhs,
    p.num_bedrooms,
    p.size_sqft
FROM properties p
JOIN localities l ON p.locality_id = l.locality_id
WHERE p.selling_price = (SELECT MAX(selling_price) FROM properties);

-- ------------------------------------------------------------
-- QUERY 6B: Highest rent property
-- ------------------------------------------------------------
SELECT
    p.property_id,
    p.property_type,
    p.address_line,
    l.locality_name,
    p.monthly_rent,
    p.num_bedrooms,
    p.size_sqft
FROM properties p
JOIN localities l ON p.locality_id = l.locality_id
WHERE p.monthly_rent = (SELECT MAX(monthly_rent) FROM properties);
