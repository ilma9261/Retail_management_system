import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import stockTransferRoutes from './routes/stockTransfer.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'retailflow-backend', database: 'MySQL' }));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'retailflow-backend', database: 'MySQL' }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/warehouses', warehouseRoutes);
app.use('/warehouses', warehouseRoutes);

app.use('/api/suppliers', supplierRoutes);
app.use('/suppliers', supplierRoutes);

app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);

app.use('/api/stock-transfers', stockTransferRoutes);
app.use('/stock-transfers', stockTransferRoutes);

app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Initialize DB and start listening if not running under a serverless wrapper
export const startServer = async () => {
  try {
    await db.initDB();
  } catch (err) {
    console.warn('⚠️ MySQL connection warning (retrying in background):', err.message);
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 RetailFlow MySQL Backend running on port ${PORT}`);
    });
  }
};

startServer();

export default app;
