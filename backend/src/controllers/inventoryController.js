import db from '../config/db.js';

// Get comprehensive inventory list with warehouse breakdowns
export const getInventory = async (req, res) => {
  try {
    const pool = db.getPool();
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.product_id AS productId,
        i.warehouse_id AS warehouseId,
        i.quantity,
        i.last_updated AS lastUpdated,
        p.name AS productName,
        p.sku,
        p.purchase_price AS purchasePrice,
        p.selling_price AS sellingPrice,
        w.name AS warehouseName
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN warehouses w ON i.warehouse_id = w.id
      ORDER BY i.quantity ASC;
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving inventory', error: err.message });
  }
};

// Get immutable audit transaction history
export const getTransactions = async (req, res) => {
  try {
    const pool = db.getPool();
    const [txns] = await pool.query(`
      SELECT 
        t.id,
        t.type,
        t.quantity,
        t.previous_stock AS previousStock,
        t.new_stock AS newStock,
        t.reference_type AS referenceType,
        t.reference_id AS referenceId,
        t.notes,
        t.created_at AS date,
        t.created_at AS createdAt,
        p.id AS productId,
        p.name AS productName,
        p.sku,
        w.id AS warehouseId,
        w.name AS warehouseName
      FROM inventory_transactions t
      JOIN products p ON t.product_id = p.id
      JOIN warehouses w ON t.warehouse_id = w.id
      ORDER BY t.id DESC
      LIMIT 200;
    `);

    const formatted = txns.map(t => ({
      ...t,
      id: String(t.id),
      _id: String(t.id),
      product: { id: t.productId, name: t.productName, sku: t.sku },
      warehouse: { id: t.warehouseId, name: t.warehouseName }
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving transaction log', error: err.message });
  }
};

// Stock Adjustment (STOCK_IN, STOCK_OUT, ADJUSTMENT) with ACID transaction
export const adjustStock = async (req, res) => {
  const pool = db.getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { productId, warehouseId, quantity, type, notes = '' } = req.body;
    const prodId = parseInt(productId, 10);
    const whId = parseInt(warehouseId, 10);
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Adjustment quantity must be a positive integer' });
    }

    // 1. Fetch current warehouse inventory
    const [invRows] = await conn.query('SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE;', [prodId, whId]);
    const currentWhStock = invRows.length > 0 ? invRows[0].quantity : 0;

    // 2. Fetch current total product stock
    const [prodRows] = await conn.query('SELECT stock FROM products WHERE id = ? FOR UPDATE;', [prodId]);
    if (prodRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }
    const currentTotalStock = prodRows[0].stock;

    let newWhStock = currentWhStock;
    let newTotalStock = currentTotalStock;

    if (type === 'STOCK_IN') {
      newWhStock = currentWhStock + qty;
      newTotalStock = currentTotalStock + qty;
    } else if (type === 'STOCK_OUT') {
      if (currentWhStock < qty) {
        await conn.rollback();
        return res.status(400).json({ message: `Insufficient inventory in selected warehouse. Available: ${currentWhStock}, requested deduction: ${qty}. Negative inventory is prohibited.` });
      }
      newWhStock = currentWhStock - qty;
      newTotalStock = Math.max(0, currentTotalStock - qty);
    } else if (type === 'ADJUSTMENT') {
      // Re-set warehouse count directly
      newWhStock = qty;
      newTotalStock = currentTotalStock - currentWhStock + qty;
    } else {
      await conn.rollback();
      return res.status(400).json({ message: `Unknown adjustment type "${type}"` });
    }

    // 3. Upsert inventory table
    await conn.query(`
      INSERT INTO inventory (product_id, warehouse_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);
    `, [prodId, whId, newWhStock]);

    // 4. Update overall product stock
    await conn.query('UPDATE products SET stock = ? WHERE id = ?;', [newTotalStock, prodId]);

    // 5. Append immutable audit transaction
    await conn.query(`
      INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, previous_stock, new_stock, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [prodId, whId, type, qty, currentWhStock, newWhStock, notes || `Manual ${type} stock adjustment`]);

    await conn.commit();

    res.json({
      message: 'Stock adjusted successfully',
      productId: prodId,
      warehouseId: whId,
      previousStock: currentWhStock,
      newStock: newWhStock,
      totalProductStock: newTotalStock
    });
  } catch (err) {
    await conn.rollback();
    console.error('adjustStock error:', err);
    res.status(500).json({ message: 'Stock adjustment failed', error: err.message });
  } finally {
    conn.release();
  }
};
