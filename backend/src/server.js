import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js';
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
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/debug-db', async (req, res) => {
  try {
    const { connectDB } = await import('./config/db.js');
    await connectDB();
    const mongoose = (await import('mongoose')).default;
    res.json({
      status: 'ok',
      readyState: mongoose.connection.readyState,
      uriDefined: !!process.env.MONGODB_URI,
      host: mongoose.connection.host,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      uriDefined: !!process.env.MONGODB_URI,
      name: err.name,
      message: err.message,
      code: err.code,
      reason: err.reason ? String(err.reason) : null
    });
  }
});

// Routes mounted at both /api/* and /* for full portability across standalone and serverless environments
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

// Global error handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

export default app;
