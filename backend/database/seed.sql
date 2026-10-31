-- =============================================================================
-- Capstone Project P_022: Retail Inventory Management System
-- Seed Data for MySQL (Users, Warehouses, Categories, Suppliers, Products)
-- =============================================================================

USE retailflow_db;

-- 1. Default Users (Pass: Admin@123 -> bcrypt hash)
INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES
(1, 'admin@retailflow.com', '$2a$10$UXtT6PAiAYI7pzdeSn1A.eaY24Smd2eEbRkMm5n4.Q6KmQ3Ynbxom', 'admin', 'Rajesh', 'Verma'),
(2, 'manager@retailflow.com', '$2a$10$UXtT6PAiAYI7pzdeSn1A.eaY24Smd2eEbRkMm5n4.Q6KmQ3Ynbxom', 'manager', 'Priya', 'Sharma'),
(3, 'staff@retailflow.com', '$2a$10$UXtT6PAiAYI7pzdeSn1A.eaY24Smd2eEbRkMm5n4.Q6KmQ3Ynbxom', 'staff', 'Amit', 'Kumar')
ON DUPLICATE KEY UPDATE email=VALUES(email), password_hash=VALUES(password_hash);

-- 2. Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Electronics', 'Consumer electronics, accessories, smart devices, and gadgets'),
(2, 'Clothing', 'Men, women, and kids apparel, denim, and sportswear'),
(3, 'Food & Beverage', 'Packaged food items, teas, health beverages, and snacks'),
(4, 'Furniture', 'Ergonomic office furniture, home decor, and modular units'),
(5, 'Sports', 'Fitness equipment, supplements, and workout gear')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Warehouses
INSERT INTO warehouses (id, code, name, location, manager_name, contact_number, storage_capacity, current_stock_units, status) VALUES
(1, 'WH-DEL-01', 'Delhi Central Logistics Hub', 'Okhla Phase III, New Delhi', 'Vikram Malhotra', '+91 98110 23456', 50000, 620, 'active'),
(2, 'WH-NOI-02', 'Noida High-Tech Depot', 'Sector 62, Noida, Uttar Pradesh', 'Sunita Rao', '+91 98220 34567', 35000, 420, 'active'),
(3, 'WH-GZB-03', 'Ghaziabad Fulfillment Hub', 'Loni Road, Ghaziabad, UP', 'Rakesh Singh', '+91 98330 45678', 25000, 101, 'active')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 4. Suppliers
INSERT INTO suppliers (id, code, name, company_name, email, phone, address, status) VALUES
(1, 'SUP-001', 'Rahul Gupta', 'TechVision Infotech Pvt Ltd', 'procurement@techvision.in', '+91 98001 12345', 'Bavdhan, Pune, Maharashtra', 'active'),
(2, 'SUP-002', 'Anil Mehta', 'Apex Textile & Apparel Mills', 'orders@apextextiles.com', '+91 97112 34567', 'Ring Road, Surat, Gujarat', 'active'),
(3, 'SUP-003', 'Kavita Chawla', 'PureHarvest Organic Agro', 'bulk@pureharvest.co.in', '+91 96500 98765', 'MIDC, Nashik, Maharashtra', 'active')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- 5. Products
INSERT INTO products (id, sku, name, description, category_id, purchase_price, selling_price, stock, min_stock_level, supplier_id, primary_warehouse_id) VALUES
(1, 'ELEC-WBH-001', 'Wireless Noise-Cancelling Headphones', 'Over-ear Bluetooth 5.2 ANC headphones with 40h battery life', 1, 1499.00, 2499.00, 150, 20, 1, 1),
(2, 'ELEC-SW5-002', 'Smart Watch Series 5 with AMOLED', 'Waterproof fitness smartwatch with SpO2 and heart-rate monitoring', 1, 2899.00, 4499.00, 60, 15, 1, 1),
(3, 'ELEC-UCH-003', 'USB-C Multiport Adapter 7-in-1', 'Aluminum Type-C hub with 4K HDMI, 100W PD, SD card slot', 1, 850.00, 1499.00, 5, 15, 1, 2),
(4, 'CLTH-TS3-001', 'Premium Cotton T-Shirt Pack (3-Pack)', '100% combed breathable cotton crew-neck tees', 2, 450.00, 899.00, 300, 50, 2, 2),
(5, 'CLTH-DJ-002', 'Denim Jeans Slim Stretch Fit', 'Classic 5-pocket durable stretch denim pants', 2, 850.00, 1699.00, 120, 25, 2, 2),
(6, 'FNB-OGT-001', 'Organic Darjeeling Green Tea (500g)', 'Handpicked whole leaf antioxidant rich pure green tea', 3, 220.00, 399.00, 500, 80, 3, 1),
(7, 'SPT-PPC-001', 'Whey Protein Isolate Chocolate (1kg)', '27g protein per serving with BCAA and digestive enzymes', 5, 1400.00, 2299.00, 6, 20, 3, 3),
(8, 'FURN-OCE-001', 'Ergonomic Mesh High-Back Office Chair', 'Adjustable lumbar support with 3D armrests and reclining tilt', 4, 4200.00, 7499.00, 0, 5, 1, 1)
ON DUPLICATE KEY UPDATE sku=VALUES(sku);

-- 6. Inventory Distribution per Warehouse
INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES
(1, 1, 100), (1, 2, 50),
(2, 1, 40), (2, 2, 20),
(3, 2, 5),
(4, 2, 200), (4, 3, 100),
(5, 1, 70), (5, 2, 50),
(6, 1, 400), (6, 3, 100),
(7, 3, 6),
(8, 1, 0)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 7. Initial Purchase Orders
INSERT INTO purchase_orders (id, po_number, supplier_id, target_warehouse_id, status, total_amount, expected_delivery, notes) VALUES
(1, 'PO-2026-001', 1, 1, 'Received', 149900.00, '2026-10-25', 'Inbound batch of ANC Headphones'),
(2, 'PO-2026-002', 2, 2, 'Approved', 135000.00, '2026-11-05', 'Winter apparel seasonal restock'),
(3, 'PO-2026-003', 3, 3, 'Pending', 70000.00, '2026-11-10', 'Protein supplement replenishment')
ON DUPLICATE KEY UPDATE po_number=VALUES(po_number);

-- 8. Purchase Order Items
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 100, 1499.00, 149900.00),
(2, 4, 300, 450.00, 135000.00),
(3, 7, 50, 1400.00, 70000.00);

-- 9. Initial Audit Transactions
INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, previous_stock, new_stock, notes) VALUES
(1, 1, 'STOCK_IN', 100, 0, 100, 'Initial procurement receipt from PO-2026-001'),
(4, 2, 'STOCK_IN', 200, 0, 200, 'Initial batch receipt'),
(7, 3, 'STOCK_OUT', 4, 10, 6, 'Retail store dispatches');
