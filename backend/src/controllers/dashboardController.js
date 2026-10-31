import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [products, warehouses, suppliers, purchaseOrders, recentTxns] = await Promise.all([
      Product.find(),
      Warehouse.find(),
      Supplier.find(),
      PurchaseOrder.find(),
      InventoryTransaction.find().sort({ createdAt: -1 }).limit(100).populate('product','name sku').populate('warehouse','name'),
    ]);

    const totalProducts = products.length;
    const totalStockUnits = products.reduce((a, p) => a + (p.stock || 0), 0);
    const totalStockValue = products.reduce((a, p) => a + (p.stock || 0) * (p.purchasePrice || 0), 0);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
    const outOfStockProducts = products.filter(p => p.stock <= 0);
    const pendingPOs = purchaseOrders.filter(po => ['Pending','Approved','Draft'].includes(po.status)).length;

    // Category breakdown
    const catMap = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, units: 0, value: 0 };
      catMap[cat].count++;
      catMap[cat].units += p.stock || 0;
      catMap[cat].value += (p.stock || 0) * (p.purchasePrice || 0);
    });

    // Monthly movement
    const movMap = {};
    recentTxns.forEach(t => {
      const month = new Date(t.createdAt).toLocaleString('en-US', { month: 'short' });
      if (!movMap[month]) movMap[month] = { month, stockIn: 0, stockOut: 0 };
      if (t.type === 'STOCK_IN' || t.type === 'TRANSFER_IN') movMap[month].stockIn += Math.abs(t.quantity);
      else if (t.type === 'STOCK_OUT' || t.type === 'TRANSFER_OUT') movMap[month].stockOut += Math.abs(t.quantity);
    });

    res.json({
      totalProducts,
      totalStockUnits,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalWarehouses: warehouses.length,
      totalSuppliers: suppliers.length,
      pendingPurchaseOrders: pendingPOs,
      lowStockProducts,
      outOfStockProducts,
      categoryBreakdown: Object.values(catMap),
      monthlyMovement: Object.values(movMap),
      recentTransactions: recentTxns.slice(0, 10),
      warehouseBreakdown: warehouses.map(w => ({ ...w.toObject(), occupancyRate: w.capacity ? Math.min(100, Math.round((w.currentStockUnits / w.capacity) * 100)) : 0 }))
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
