-- ============================================================
-- FILE: sql/schema.sql
-- Real Estate Office DBMS - Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS real_estate_db;
USE real_estate_db;

-- ------------------------------------------------------------
-- TABLE: agents
-- ------------------------------------------------------------
CREATE TABLE agents (
    agent_id     INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(50)  NOT NULL,
    last_name    VARCHAR(50)  NOT NULL,
    phone        VARCHAR(15)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    hire_date    DATE         NOT NULL,
    license_no   VARCHAR(30)  NOT NULL UNIQUE,
    CONSTRAINT chk_agent_phone CHECK (phone REGEXP '^[0-9]{10,15}$')
);

-- ------------------------------------------------------------
-- TABLE: localities
-- ------------------------------------------------------------
CREATE TABLE localities (
    locality_id   INT AUTO_INCREMENT PRIMARY KEY,
    locality_name VARCHAR(100) NOT NULL,
    city          VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
    pincode       CHAR(6)      NOT NULL,
    CONSTRAINT uq_locality UNIQUE (locality_name, pincode)
);

-- ------------------------------------------------------------
-- TABLE: properties
-- ------------------------------------------------------------
CREATE TABLE properties (
    property_id       INT AUTO_INCREMENT PRIMARY KEY,
    property_type     ENUM('House','Apartment') NOT NULL,
    address_line      VARCHAR(200) NOT NULL,
    locality_id       INT          NOT NULL,
    selling_price     DECIMAL(12,2) NOT NULL,         -- in INR
    monthly_rent      DECIMAL(10,2) NOT NULL,          -- in INR/month
    size_sqft         DECIMAL(8,2)  NOT NULL,
    num_bedrooms      TINYINT       NOT NULL,
    year_constructed  YEAR          NOT NULL,
    listing_date      DATE          NOT NULL,
    status            ENUM('Available','Sold','Rented') NOT NULL DEFAULT 'Available',
    listed_by_agent   INT           NOT NULL,
    CONSTRAINT fk_prop_locality FOREIGN KEY (locality_id)
        REFERENCES localities(locality_id) ON UPDATE CASCADE,
    CONSTRAINT fk_prop_agent FOREIGN KEY (listed_by_agent)
        REFERENCES agents(agent_id) ON UPDATE CASCADE,
    CONSTRAINT chk_selling_price CHECK (selling_price > 0),
    CONSTRAINT chk_rent          CHECK (monthly_rent  > 0),
    CONSTRAINT chk_size          CHECK (size_sqft     > 0),
    CONSTRAINT chk_bedrooms      CHECK (num_bedrooms  > 0)
);

-- ------------------------------------------------------------
-- TABLE: clients
-- ------------------------------------------------------------
CREATE TABLE clients (
    client_id    INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(50)  NOT NULL,
    last_name    VARCHAR(50)  NOT NULL,
    phone        VARCHAR(15)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    client_type  ENUM('Buyer','Seller','Both') NOT NULL DEFAULT 'Buyer'
);

-- ------------------------------------------------------------
-- TABLE: sales_transactions
-- ------------------------------------------------------------
CREATE TABLE sales_transactions (
    sale_id         INT AUTO_INCREMENT PRIMARY KEY,
    property_id     INT           NOT NULL UNIQUE,   -- a property can be sold once
    agent_id        INT           NOT NULL,
    buyer_id        INT           NOT NULL,
    seller_id       INT           NOT NULL,
    sale_price      DECIMAL(12,2) NOT NULL,
    sale_date       DATE          NOT NULL,
    days_on_market  INT           NOT NULL,
    CONSTRAINT fk_sale_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id),
    CONSTRAINT fk_sale_agent    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id),
    CONSTRAINT fk_sale_buyer    FOREIGN KEY (buyer_id)
        REFERENCES clients(client_id),
    CONSTRAINT fk_sale_seller   FOREIGN KEY (seller_id)
        REFERENCES clients(client_id),
    CONSTRAINT chk_sale_price   CHECK (sale_price > 0),
    CONSTRAINT chk_days_market  CHECK (days_on_market >= 0)
);

-- ------------------------------------------------------------
-- TABLE: rental_transactions
-- ------------------------------------------------------------
CREATE TABLE rental_transactions (
    rental_id       INT AUTO_INCREMENT PRIMARY KEY,
    property_id     INT           NOT NULL,
    agent_id        INT           NOT NULL,
    tenant_id       INT           NOT NULL,
    owner_id        INT           NOT NULL,
    monthly_rent    DECIMAL(10,2) NOT NULL,
    start_date      DATE          NOT NULL,
    end_date        DATE,                            -- NULL = ongoing
    days_on_market  INT           NOT NULL DEFAULT 0,
    CONSTRAINT fk_rent_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id),
    CONSTRAINT fk_rent_agent    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id),
    CONSTRAINT fk_rent_tenant   FOREIGN KEY (tenant_id)
        REFERENCES clients(client_id),
    CONSTRAINT fk_rent_owner    FOREIGN KEY (owner_id)
        REFERENCES clients(client_id),
    CONSTRAINT chk_rent_amount  CHECK (monthly_rent > 0),
    CONSTRAINT chk_rent_dates   CHECK (end_date IS NULL OR end_date > start_date)
);
