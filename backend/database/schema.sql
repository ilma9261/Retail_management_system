-- =============================================================================
-- Capstone Project P_022: Retail Inventory Management System
-- Database: MySQL 8.0+
-- DDL Schema Definition (10 Relational Tables + Foreign Keys & Indexes)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS retailflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE retailflow_db;

-- 1. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_name (name)
) ENGINE=InnoDB;

-- 3. Warehouses Table (Multi-Facility Storage)
CREATE TABLE IF NOT EXISTS warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  manager_name VARCHAR(150),
  contact_number VARCHAR(50),
  storage_capacity INT NOT NULL DEFAULT 20000,
  current_stock_units INT NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_warehouses_code (code),
  INDEX idx_warehouses_status (status)
) ENGINE=InnoDB;

-- 4. Suppliers Table (Vendor Management)
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_suppliers_email (email),
  INDEX idx_suppliers_code (code)
) ENGINE=InnoDB;

-- 5. Products Table (Master Product Catalog)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 10,
  supplier_id INT,
  primary_warehouse_id INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (primary_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
  INDEX idx_products_sku (sku),
  INDEX idx_products_category (category_id),
  INDEX idx_products_supplier (supplier_id)
) ENGINE=InnoDB;

-- 6. Inventory Table (Product stock breakdown per warehouse facility)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_prod_wh (product_id, warehouse_id),
  INDEX idx_inventory_prod (product_id),
  INDEX idx_inventory_wh (warehouse_id)
) ENGINE=InnoDB;

-- 7. Purchase Orders Table (Procurement Header)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(100) NOT NULL UNIQUE,
  supplier_id INT NOT NULL,
  target_warehouse_id INT NOT NULL,
  status ENUM('Draft', 'Pending', 'Approved', 'Received', 'Cancelled') NOT NULL DEFAULT 'Draft',
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_delivery DATE,
  received_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
  FOREIGN KEY (target_warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
  INDEX idx_po_number (po_number),
  INDEX idx_po_status (status),
  INDEX idx_po_supplier (supplier_id)
) ENGINE=InnoDB;

-- 8. Purchase Order Items Table (Procurement Line Items)
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_poi_order (purchase_order_id),
  INDEX idx_poi_product (product_id)
) ENGINE=InnoDB;

-- 9. Stock Transfers Table (Inter-Facility Movement Header)
CREATE TABLE IF NOT EXISTS stock_transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transfer_number VARCHAR(100) NOT NULL UNIQUE,
  source_warehouse_id INT NOT NULL,
  destination_warehouse_id INT NOT NULL,
  status ENUM('Pending', 'In_Transit', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
  FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
  INDEX idx_st_number (transfer_number),
  INDEX idx_st_status (status)
) ENGINE=InnoDB;

-- 10. Stock Transfer Items Table (Line Items per Transfer)
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_transfer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_sti_transfer (stock_transfer_id),
  INDEX idx_sti_product (product_id)
) ENGINE=InnoDB;

-- 11. Inventory Transactions Table (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  type ENUM('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
  quantity INT NOT NULL,
  previous_stock INT NOT NULL DEFAULT 0,
  new_stock INT NOT NULL DEFAULT 0,
  reference_type VARCHAR(50),
  reference_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  INDEX idx_txn_product (product_id),
  INDEX idx_txn_warehouse (warehouse_id),
  INDEX idx_txn_type (type),
  INDEX idx_txn_date (created_at)
) ENGINE=InnoDB;
