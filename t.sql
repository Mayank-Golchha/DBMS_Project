CREATE DATABASE IF NOT EXISTS real_estate_db;
USE real_estate_db;

-- ─────────────────────────────────────────
-- TABLE: agents
-- ─────────────────────────────────────────
-- No extra indices needed.
-- agent_id is PK (clustered index).
-- phone and email already have UNIQUE constraints
-- which MySQL automatically backs with an index.
-- license_no also has UNIQUE → auto-indexed.
-- The table is small (staff list); full scans are trivial.
CREATE TABLE agents (
    agent_id    INT          AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    hire_date   DATE         NOT NULL,
    license_no  VARCHAR(30)  NOT NULL UNIQUE,
    CONSTRAINT chk_agent_phone CHECK (phone REGEXP '^[0-9]{10,15}$')
);

-- ─────────────────────────────────────────
-- TABLE: localities
-- ─────────────────────────────────────────
-- No extra indices needed.
-- locality_id is PK.
-- The UNIQUE constraint on (locality_name, pincode) is
-- already an index — it covers any lookup by locality name.
CREATE TABLE localities (
    locality_id   INT          AUTO_INCREMENT PRIMARY KEY,
    locality_name VARCHAR(100) NOT NULL,
    city          VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
    pincode       CHAR(6)      NOT NULL,
    CONSTRAINT uq_locality UNIQUE (locality_name, pincode)
);

-- ─────────────────────────────────────────
-- TABLE: properties
-- ─────────────────────────────────────────
-- Indices added:
--   idx_properties_locality  — most property searches filter by locality.
--                              Without this, every locality lookup does a full table scan.
--   idx_properties_status    — "show available properties" is the most common
--                              query; status has low cardinality but the index still
--                              helps when combined with locality in a composite scan.
--   idx_properties_agent     — FK to agents; MySQL does NOT auto-index FK columns.
--                              Needed for JOIN in agent performance queries.
--
-- NOT indexed: selling_price / monthly_rent — range queries on price are typically
-- combined with locality or status, making a standalone price index less useful.
-- The optimiser will use the locality or status index and filter price in memory.
-- Revisit if pure price-range queries become frequent.
CREATE TABLE properties (
    property_id      INT           AUTO_INCREMENT PRIMARY KEY,
    property_type    ENUM('House','Apartment') NOT NULL,
    address_line     VARCHAR(200)  NOT NULL,
    locality_id      INT           NOT NULL,
    selling_price    DECIMAL(12,2) NOT NULL,
    monthly_rent     DECIMAL(10,2) NOT NULL,
    size_sqft        DECIMAL(8,2)  NOT NULL,
    num_bedrooms     TINYINT       NOT NULL,
    year_constructed YEAR          NOT NULL,
    listing_date     DATE          NOT NULL,
    status           ENUM('Available','Sold','Rented') NOT NULL DEFAULT 'Available',
    listed_by_agent  INT           NOT NULL,
    CONSTRAINT prop_locality FOREIGN KEY (locality_id)
        REFERENCES localities(locality_id) ON UPDATE CASCADE,
    CONSTRAINT prop_agent FOREIGN KEY (listed_by_agent)
        REFERENCES agents(agent_id) ON UPDATE CASCADE,
    CONSTRAINT chk_selling_price CHECK (selling_price > 0),
    CONSTRAINT chk_rent          CHECK (monthly_rent  > 0),
    CONSTRAINT chk_size          CHECK (size_sqft     > 0),
    CONSTRAINT chk_bedrooms      CHECK (num_bedrooms  > 0),
    INDEX idx_properties_locality (locality_id),
    INDEX idx_properties_status   (status),
    INDEX idx_properties_agent    (listed_by_agent)
);

-- ─────────────────────────────────────────
-- TABLE: clients
-- ─────────────────────────────────────────
-- client_type ENUM removed entirely — roles now live in client_roles.
-- phone and email UNIQUE constraints auto-create indices.
-- No additional indices needed for this table.
CREATE TABLE clients (
    client_id   INT          AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50)  NOT NULL,
    last_name   VARCHAR(50)  NOT NULL,
    phone       VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- TABLE: client_roles  ← NEW
-- ─────────────────────────────────────────
-- Composite PK (client_id, role) serves two purposes:
--   1. Uniqueness — same client cannot have duplicate role.
--   2. Acts as the index for "give me all roles of client X".
-- A separate index on (role) alone is NOT added because
-- "give me all buyers" is a reporting query, not a hot path;
-- a full scan of this small table is acceptable.
CREATE TABLE client_roles (
    client_id   INT  NOT NULL,
    role        ENUM('Buyer','Seller','Renter') NOT NULL,
    PRIMARY KEY (client_id, role),
    CONSTRAINT fk_cr_client FOREIGN KEY (client_id)
        REFERENCES clients(client_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- TABLE: sales_transactions
-- ─────────────────────────────────────────
-- Indices added:
--   idx_sales_agent  — FK not auto-indexed; needed for agent performance queries
--                      (Query 4 and 5 from original file both JOIN on agent_id).
--
-- NOT indexed: buyer_id / seller_id — lookups of "all sales by a buyer" are
-- infrequent reporting queries; the PK + agent index covers the hot paths.
-- property_id already has UNIQUE constraint → auto-indexed.
-- sale_date is not indexed separately — year-based filters (YEAR(sale_date)=2023)
-- are non-sargable anyway and won't use a B-tree index efficiently.
CREATE TABLE sales_transactions (
    sale_id        INT           AUTO_INCREMENT PRIMARY KEY,
    property_id    INT           NOT NULL UNIQUE,
    agent_id       INT           NOT NULL,
    buyer_id       INT           NOT NULL,
    seller_id      INT           NOT NULL,
    sale_price     DECIMAL(12,2) NOT NULL,
    sale_date      DATE          NOT NULL,
    days_on_market INT           NOT NULL,
    CONSTRAINT sale_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id),
    CONSTRAINT sale_agent    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id),
    CONSTRAINT sale_buyer    FOREIGN KEY (buyer_id)
        REFERENCES clients(client_id),
    CONSTRAINT sale_seller   FOREIGN KEY (seller_id)
        REFERENCES clients(client_id),
    CONSTRAINT chk_sale_price  CHECK (sale_price     > 0),
    CONSTRAINT chk_days_market CHECK (days_on_market >= 0),
    CONSTRAINT chk_buyer_seller CHECK (buyer_id <> seller_id),
    INDEX idx_sales_agent (agent_id)
);

-- ─────────────────────────────────────────
-- TABLE: rental_transactions
-- ─────────────────────────────────────────
-- end_date fix:
--   The column stays nullable (NULL = ongoing lease — correct).
--   Added a GENERATED column is_active so application code never has
--   to write "WHERE end_date IS NULL OR end_date > CURDATE()" repeatedly.
--   is_active = 1 means the lease is currently running.
--
-- Indices added:
--   idx_rentals_agent    — same reason as sales; agent FK not auto-indexed.
--   idx_rentals_active   — "show all active rentals" is a very common query;
--                          is_active is a computed boolean so this index is tiny
--                          but directly answers the hot query pattern.
--
-- NOT indexed: tenant_id / owner_id — same reasoning as buyer/seller above.
-- property_id not indexed separately — it's part of a frequent JOIN but the
-- table is small enough that the FK + PK scan is acceptable; revisit at scale.
CREATE TABLE rental_transactions (
    rental_id      INT           AUTO_INCREMENT PRIMARY KEY,
    property_id    INT           NOT NULL,
    agent_id       INT           NOT NULL,
    tenant_id      INT           NOT NULL,
    owner_id       INT           NOT NULL,
    monthly_rent   DECIMAL(10,2) NOT NULL,
    start_date     DATE          NOT NULL,
    end_date       DATE          DEFAULT NULL,            -- NULL = ongoing
    days_on_market INT           NOT NULL DEFAULT 0,
    is_active      TINYINT(1)
        GENERATED ALWAYS AS (
            CASE
                WHEN end_date IS NULL         THEN 1     -- ongoing
                WHEN end_date > CURDATE()     THEN 1     -- not yet expired
                ELSE 0
            END
        ) VIRTUAL,
    CONSTRAINT rent_property FOREIGN KEY (property_id)
        REFERENCES properties(property_id),
    CONSTRAINT rent_agent    FOREIGN KEY (agent_id)
        REFERENCES agents(agent_id),
    CONSTRAINT rent_tenant   FOREIGN KEY (tenant_id)
        REFERENCES clients(client_id),
    CONSTRAINT rent_owner    FOREIGN KEY (owner_id)
        REFERENCES clients(client_id),
    CONSTRAINT chk_rent_amount CHECK (monthly_rent > 0),
    CONSTRAINT chk_rent_dates  CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT chk_renter_owner CHECK (tenant_id <> owner_id),
    INDEX idx_rentals_agent  (agent_id),
    INDEX idx_rentals_active (is_active)
);