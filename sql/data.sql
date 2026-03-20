-- ============================================================
-- FILE: sql/data.sql
-- Real Estate Office DBMS - Sample Data
-- ============================================================

USE real_estate_db;

-- ------------------------------------------------------------
-- AGENTS (12 records)
-- ------------------------------------------------------------
INSERT INTO agents (first_name, last_name, phone, email, hire_date, license_no) VALUES
('Ravi',      'Sharma',    '9876543210', 'ravi.sharma@realty.in',    '2015-03-10', 'MH-AGT-001'),
('Priya',     'Mehta',     '9876543211', 'priya.mehta@realty.in',    '2016-07-22', 'MH-AGT-002'),
('Arjun',     'Patel',     '9876543212', 'arjun.patel@realty.in',    '2017-01-15', 'MH-AGT-003'),
('Sneha',     'Iyer',      '9876543213', 'sneha.iyer@realty.in',     '2018-09-05', 'MH-AGT-004'),
('Vikram',    'Nair',      '9876543214', 'vikram.nair@realty.in',    '2019-04-18', 'MH-AGT-005'),
('Anjali',    'Gupta',     '9876543215', 'anjali.gupta@realty.in',   '2017-11-30', 'MH-AGT-006'),
('Rohit',     'Desai',     '9876543216', 'rohit.desai@realty.in',    '2020-02-14', 'MH-AGT-007'),
('Neha',      'Singh',     '9876543217', 'neha.singh@realty.in',     '2018-06-25', 'MH-AGT-008'),
('Sanjay',    'Verma',     '9876543218', 'sanjay.verma@realty.in',   '2016-12-01', 'MH-AGT-009'),
('Divya',     'Kapoor',    '9876543219', 'divya.kapoor@realty.in',   '2021-03-08', 'MH-AGT-010'),
('Aakash',    'Rao',       '9876543220', 'aakash.rao@realty.in',     '2019-08-19', 'MH-AGT-011'),
('Meena',     'Bose',      '9876543221', 'meena.bose@realty.in',     '2022-01-11', 'MH-AGT-012');

-- ------------------------------------------------------------
-- LOCALITIES (8 records)
-- ------------------------------------------------------------
INSERT INTO localities (locality_name, city, pincode) VALUES
('Andheri West',  'Mumbai', '400053'),
('Bandra East',   'Mumbai', '400051'),
('Powai',         'Mumbai', '400076'),
('Malad West',    'Mumbai', '400064'),
('Borivali North','Mumbai', '400066'),
('Thane West',    'Mumbai', '400601'),
('Navi Mumbai',   'Mumbai', '400703'),
('Juhu',          'Mumbai', '400049');

-- ------------------------------------------------------------
-- CLIENTS (20 records)
-- ------------------------------------------------------------
INSERT INTO clients (first_name, last_name, phone, email, client_type) VALUES
('Amit',      'Shah',       '9000000001', 'amit.shah@gmail.com',      'Buyer'),
('Pooja',     'Joshi',      '9000000002', 'pooja.joshi@gmail.com',    'Seller'),
('Karan',     'Malhotra',   '9000000003', 'karan.m@gmail.com',        'Buyer'),
('Sunita',    'Reddy',      '9000000004', 'sunita.r@gmail.com',       'Both'),
('Tarun',     'Ghosh',      '9000000005', 'tarun.g@gmail.com',        'Buyer'),
('Nalini',    'Pillai',     '9000000006', 'nalini.p@gmail.com',       'Seller'),
('Deepak',    'Kumar',      '9000000007', 'deepak.k@gmail.com',       'Buyer'),
('Rashmi',    'Saxena',     '9000000008', 'rashmi.s@gmail.com',       'Both'),
('Nikhil',    'Tiwari',     '9000000009', 'nikhil.t@gmail.com',       'Buyer'),
('Kavita',    'Menon',      '9000000010', 'kavita.m@gmail.com',       'Seller'),
('Shyam',     'Agrawal',    '9000000011', 'shyam.a@gmail.com',        'Buyer'),
('Ritu',      'Bajaj',      '9000000012', 'ritu.b@gmail.com',         'Seller'),
('Mohit',     'Chandra',    '9000000013', 'mohit.c@gmail.com',        'Buyer'),
('Lavanya',   'Naik',       '9000000014', 'lavanya.n@gmail.com',      'Both'),
('Suresh',    'Pandey',     '9000000015', 'suresh.p@gmail.com',       'Buyer'),
('Geeta',     'Bhatt',      '9000000016', 'geeta.b@gmail.com',        'Seller'),
('Rahul',     'Srivastava', '9000000017', 'rahul.sr@gmail.com',       'Buyer'),
('Asha',      'Mishra',     '9000000018', 'asha.mis@gmail.com',       'Seller'),
('Vinod',     'Tripathi',   '9000000019', 'vinod.t@gmail.com',        'Buyer'),
('Shalini',   'Dubey',      '9000000020', 'shalini.d@gmail.com',      'Both');

-- ------------------------------------------------------------
-- PROPERTIES (25 records)
-- selling_price in INR (e.g. 4500000 = 45 Lakh)
-- ------------------------------------------------------------
INSERT INTO properties
  (property_type, address_line, locality_id, selling_price, monthly_rent, size_sqft, num_bedrooms, year_constructed, listing_date, status, listed_by_agent)
VALUES
-- Andheri West (locality 1)
('Apartment', 'A-101, Sunrise Heights, Link Road',      1, 4500000,  18000, 850,  2, 2010, '2023-01-15', 'Available', 1),
('House',     '12, Shanti Nagar, S V Road',             1, 7200000,  25000, 1400, 3, 2005, '2022-11-01', 'Sold',      2),
('Apartment', 'B-204, Park View Residency, DN Nagar',   1, 3200000,  13000, 650,  1, 2018, '2024-03-10', 'Available', 1),

-- Bandra East (locality 2)
('Apartment', 'C-301, Royal Enclave, BKC Road',         2, 8500000,  35000, 1100, 3, 2015, '2018-01-05', 'Sold',      3),
('House',     '7, Hill View Bungalow, Reclamation',     2, 15000000, 55000, 2200, 4, 2019, '2023-09-05', 'Available', 4),
('Apartment', 'D-502, Sky Towers, Kalanagar',           2, 5600000,  22000, 950,  2, 2020, '2024-01-11', 'Rented',    3),

-- Powai (locality 3)
('Apartment', 'E-103, Hiranandani Estate, Powai Lake',  3, 9200000,  38000, 1250, 3, 2017, '2023-04-02', 'Available', 5),
('House',     '3, Green Valley, IIT Road',              3, 12000000, 45000, 1800, 4, 2008, '2022-07-15', 'Sold',      6),
('Apartment', 'F-201, Lake Breeze, Nirvana Park',       3, 2800000,  11000, 580,  1, 2021, '2024-05-18', 'Available', 5),

-- Malad West (locality 4)
('Apartment', 'G-404, Cosmos Heights, Malad Link Rd',  4, 3800000,  14500, 720,  2, 2016, '2023-08-22', 'Available', 7),
('House',     '22, Orchid Greens, Marve Road',          4, 5500000,  19000, 1100, 3, 2012, '2023-02-28', 'Available', 8),
('Apartment', 'H-105, Pearl Towers, Kandivali Border',  4, 2500000,  10000, 520,  1, 2019, '2024-02-14', 'Available', 7),

-- Borivali North (locality 5)
('House',     '8, Shree Nagar, Eksar Road',             5, 6800000,  23000, 1350, 3, 2011, '2023-05-10', 'Sold',      9),
('Apartment', 'I-302, Om Shanti, IC Colony',            5, 3100000,  12000, 670,  2, 2020, '2024-04-01', 'Available', 10),
('House',     '15, Sai Niwas, Borivali East',           5, 4200000,  16000, 900,  2, 2023, '2024-06-01', 'Available', 9),

-- Thane West (locality 6)
('Apartment', 'J-601, Highland Park, Ghodbunder Rd',   6, 4800000,  17500, 980,  2, 2022, '2023-10-15', 'Available', 11),
('House',     '5, Vedant Villa, Pokhran Road 2',        6, 9500000,  34000, 1700, 4, 2018, '2023-07-20', 'Rented',    12),
('Apartment', 'K-203, Shree Riddhi, Majiwada',         6, 2200000,  9000,  480,  1, 2017, '2024-01-25', 'Available', 11),

-- Navi Mumbai (locality 7)
('Apartment', 'L-401, Arihant Aura, Kharghar Sector 7',7, 3500000,  13500, 700,  2, 2023, '2024-03-05', 'Available', 1),
('House',     '11, Seawood Palms, Belapur CBD',         7, 7600000,  28000, 1500, 3, 2014, '2023-11-12', 'Available', 2),
('Apartment', 'M-101, Vashi Residency, Sector 17',     7, 5100000,  20000, 870,  2, 2016, '2022-09-30', 'Sold',      3),

-- Juhu (locality 8)
('House',     '2, Juhu Tara Road Bungalow',             8, 25000000, 90000, 3200, 5, 2020, '2024-02-01', 'Available', 4),
('Apartment', 'N-803, Seaview Heights, JVPD Scheme',   8, 11000000, 42000, 1400, 3, 2019, '2023-12-15', 'Available', 5),
('House',     '18, Gulmohar Road, Juhu Scheme',         8, 19000000, 70000, 2800, 4, 2024, '2024-06-10', 'Available', 6),
('Apartment', 'O-205, Coconut Grove, Santacruz West',  8, 6200000,  24000, 1050, 2, 2015, '2023-03-22', 'Available', 7);

-- ------------------------------------------------------------
-- SALES TRANSACTIONS (8 records)
-- ------------------------------------------------------------
INSERT INTO sales_transactions
  (property_id, agent_id, buyer_id, seller_id, sale_price, sale_date, days_on_market)
VALUES
(2,  2,  1,  2,  7000000,  '2023-03-15', 134),   -- Priya    | Andheri West House
(8,  6,  3,  6,  11800000, '2023-07-22', 252),   -- Anjali   | Powai House
(13, 9,  5,  10, 6700000,  '2023-11-10', 184),   -- Sanjay   | Borivali House
(21, 3,  7,  16, 5050000,  '2023-09-01', 305),   -- Arjun    | Navi Mumbai Apt
(4,  4,  9,  12, 8400000,  '2018-03-15', 98),    -- Sneha    | Bandra Apt (2018)
(11, 8,  11, 18, 5400000,  '2018-06-20', 155),   -- Neha     | Malad House (2018)
(20, 2,  13, 14, 7500000,  '2018-09-12', 210),   -- Priya    | Navi Mumbai House (2018)
(17, 12, 15, 20, 9300000,  '2018-12-01', 175);   -- Meena    | Thane House (2018)

-- ------------------------------------------------------------
-- RENTAL TRANSACTIONS (8 records)
-- ------------------------------------------------------------
INSERT INTO rental_transactions
  (property_id, agent_id, tenant_id, owner_id, monthly_rent, start_date, end_date, days_on_market)
VALUES
(6,  3,  2,  6,  22000, '2023-08-01', '2024-07-31', 42),
(17, 12, 4,  10, 34000, '2023-12-01', NULL,          62),
(1,  1,  7,  16, 18000, '2024-04-15', NULL,          89),
(9,  5,  9,  12, 11000, '2024-06-01', NULL,          13),
(10, 7,  11, 18, 14500, '2023-10-10', '2024-09-30',  18),
(14, 10, 13, 14, 12000, '2024-05-01', NULL,          31),
(18, 11, 15, 20, 13500, '2024-04-20', NULL,          15),
(22, 5,  17, 18, 42000, '2024-03-01', NULL,          29);