import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

import User from './models/User.js';
import Category from './models/Category.js';
import Warehouse from './models/Warehouse.js';
import Supplier from './models/Supplier.js';
import Product from './models/Product.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Category.deleteMany(), Warehouse.deleteMany(), Supplier.deleteMany(), Product.deleteMany()]);

  // Users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await User.create([
    { email: 'admin@retailflow.com', password: adminPassword, role: 'admin' },
    { email: 'manager@retailflow.com', password: await bcrypt.hash('Manager@123', 10), role: 'manager' },
  ]);

  // Categories
  const cats = await Category.create([
    { name: 'Electronics', description: 'Electronic gadgets and devices' },
    { name: 'Clothing', description: 'Apparel and fashion' },
    { name: 'Food & Beverage', description: 'Consumable products' },
    { name: 'Furniture', description: 'Home and office furniture' },
    { name: 'Sports', description: 'Sports and fitness equipment' },
  ]);

  // Warehouses
  const warehouses = await Warehouse.create([
    { name: 'Main Warehouse', location: 'Mumbai, Maharashtra', managerName: 'Rajesh Kumar', contactNumber: '9876543210', capacity: 50000, status: 'active' },
    { name: 'North Depot', location: 'Delhi, NCR', managerName: 'Priya Sharma', contactNumber: '9123456789', capacity: 30000, status: 'active' },
    { name: 'South Hub', location: 'Bangalore, Karnataka', managerName: 'Ankit Patel', contactNumber: '9000012345', capacity: 20000, status: 'active' },
  ]);

  // Suppliers
  const suppliers = await Supplier.create([
    { name: 'TechVision Pvt Ltd', companyName: 'TechVision Pvt Ltd', email: 'supply@techvision.com', phone: '9800012345', address: 'Pune, Maharashtra', status: 'active' },
    { name: 'Fashion Hub India', companyName: 'Fashion Hub India', email: 'orders@fashionhub.in', phone: '9711234567', address: 'Surat, Gujarat', status: 'active' },
    { name: 'FreshFoods Co', companyName: 'FreshFoods Co', email: 'bulk@freshfoods.com', phone: '9650098765', address: 'Nashik, Maharashtra', status: 'active' },
  ]);

  // Products
  await Product.create([
    { name: 'Wireless Bluetooth Headphones', sku: 'ELEC-WBH-001', category: 'Electronics', purchasePrice: 1200, sellingPrice: 1999, stock: 150, minStock: 20, supplier: suppliers[0]._id, warehouse: warehouses[0]._id },
    { name: 'Smart Watch Series 5', sku: 'ELEC-SW5-002', category: 'Electronics', purchasePrice: 4500, sellingPrice: 7499, stock: 60, minStock: 10, supplier: suppliers[0]._id, warehouse: warehouses[0]._id },
    { name: 'Cotton T-Shirt Pack (3)', sku: 'CLTH-TS3-001', category: 'Clothing', purchasePrice: 350, sellingPrice: 699, stock: 300, minStock: 50, supplier: suppliers[1]._id, warehouse: warehouses[1]._id },
    { name: 'Denim Jeans Slim Fit', sku: 'CLTH-DJ-002', category: 'Clothing', purchasePrice: 800, sellingPrice: 1499, stock: 120, minStock: 25, supplier: suppliers[1]._id, warehouse: warehouses[1]._id },
    { name: 'Organic Green Tea 500g', sku: 'FNB-OGT-001', category: 'Food & Beverage', purchasePrice: 180, sellingPrice: 349, stock: 500, minStock: 100, supplier: suppliers[2]._id, warehouse: warehouses[0]._id },
    { name: 'Protein Powder Chocolate 1kg', sku: 'SPT-PPC-001', category: 'Sports', purchasePrice: 900, sellingPrice: 1599, stock: 8, minStock: 15, supplier: suppliers[2]._id, warehouse: warehouses[2]._id },
    { name: 'Office Chair Ergonomic', sku: 'FURN-OCE-001', category: 'Furniture', purchasePrice: 4200, sellingPrice: 7999, stock: 0, minStock: 5, supplier: suppliers[0]._id, warehouse: warehouses[0]._id },
    { name: 'USB-C Hub 7-in-1', sku: 'ELEC-UCH-003', category: 'Electronics', purchasePrice: 850, sellingPrice: 1299, stock: 3, minStock: 10, supplier: suppliers[0]._id, warehouse: warehouses[1]._id },
  ]);

  console.log('✅ Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
