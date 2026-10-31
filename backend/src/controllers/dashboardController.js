import db from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const pool = db.getPool();

    // 1. Overall counts and valuation
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(p.id) AS totalProducts,
        COALESCE(SUM(p.stock), 0) AS totalStockUnits,
        COALESCE(SUM(p.stock * p.purchase_price), 0) AS totalStockValue,
        SUM(CASE WHEN p.stock > 0 AND p.stock <= p.min_stock_level THEN 1 ELSE 0 END) AS lowStockCount,
        SUM(CASE WHEN p.stock <= 0 THEN 1 ELSE 0 END) AS outOfStockCount
      FROM products p;
    `);

    const [whCount] = await pool.query('SELECT COUNT(id) AS totalWarehouses FROM warehouses;');
    const [supCount] = await pool.query('SELECT COUNT(id) AS totalSuppliers FROM suppliers;');
    const [poCount] = await pool.query("SELECT COUNT(id) AS pendingPOs FROM purchase_orders WHERE status IN ('Draft', 'Pending', 'Approved');");

    // 2. Category distribution
    const [categoryRows] = await pool.query(`
      SELECT 
        COALESCE(c.name, 'Other') AS category,
        COUNT(p.id) AS count,
        COALESCE(SUM(p.stock), 0) AS units,
        COALESCE(SUM(p.stock * p.purchase_price), 0) AS value
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY units DESC;
    `);

    // 3. Warehouse storage capacity breakdown
    const [warehouseRows] = await pool.query(`
      SELECT 
        w.id,
        w.name,
        w.storage_capacity AS capacity,
        COALESCE(SUM(i.quantity), 0) AS currentStockUnits,
        COALESCE(SUM(i.quantity * p.purchase_price), 0) AS totalValue
      FROM warehouses w
      LEFT JOIN inventory i ON w.id = i.warehouse_id
      LEFT JOIN products p ON i.product_id = p.id
      GROUP BY w.id
      ORDER BY w.id ASC;
    `);

    const warehouseBreakdown = warehouseRows.map(w => ({
      ...w,
      occupancyRate: w.capacity ? Math.min(100, Math.round((w.currentStockUnits / w.capacity) * 100)) : 0
    }));

    // 4. Monthly movement from inventory transactions
    const [movementRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') AS month,
        SUM(CASE WHEN type IN ('STOCK_IN', 'TRANSFER_IN') THEN quantity ELSE 0 END) AS stockIn,
        SUM(CASE WHEN type IN ('STOCK_OUT', 'TRANSFER_OUT') THEN quantity ELSE 0 END) AS stockOut
      FROM inventory_transactions
      GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
      ORDER BY MONTH(created_at) ASC;
    `);

    // 5. Low stock alerts
    const [lowStockProducts] = await pool.query(`
      SELECT id, sku, name, stock, min_stock_level AS minStockLevel
      FROM products
      WHERE stock <= min_stock_level
      ORDER BY stock ASC
      LIMIT 10;
    `);

    const summary = summaryRows[0] || {};

    res.json({
      totalProducts: Number(summary.totalProducts) || 0,
      totalStockUnits: Number(summary.totalStockUnits) || 0,
      totalStockValue: Number(summary.totalStockValue) || 0,
      lowStockCount: Number(summary.lowStockCount) || 0,
      outOfStockCount: Number(summary.outOfStockCount) || 0,
      totalWarehouses: Number(whCount[0]?.totalWarehouses) || 0,
      totalSuppliers: Number(supCount[0]?.totalSuppliers) || 0,
      pendingPurchaseOrders: Number(poCount[0]?.pendingPOs) || 0,
      categoryBreakdown: categoryRows.map(c => ({ ...c, units: Number(c.units), value: Number(c.value) })),
      warehouseBreakdown,
      monthlyMovement: movementRows.map(m => ({ month: m.month, stockIn: Number(m.stockIn), stockOut: Number(m.stockOut) })),
      lowStockProducts
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Error computing dashboard statistics', error: err.message });
  }
};
