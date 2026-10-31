import db from '../config/db.js';

// Get all Stock Transfers with populated source/destination facilities
export const getStockTransfers = async (req, res) => {
  try {
    const pool = db.getPool();
    const [transfers] = await pool.query(`
      SELECT 
        st.id,
        st.transfer_number AS transferNumber,
        st.source_warehouse_id AS sourceWarehouseId,
        st.destination_warehouse_id AS destinationWarehouseId,
        st.status,
        st.notes,
        st.created_at AS createdAt,
        sw.name AS sourceWarehouseName,
        dw.name AS destinationWarehouseName,
        sti.product_id AS productId,
        sti.quantity,
        p.name AS productName,
        p.sku
      FROM stock_transfers st
      LEFT JOIN warehouses sw ON st.source_warehouse_id = sw.id
      LEFT JOIN warehouses dw ON st.destination_warehouse_id = dw.id
      LEFT JOIN stock_transfer_items sti ON st.id = sti.stock_transfer_id
      LEFT JOIN products p ON sti.product_id = p.id
      ORDER BY st.id DESC;
    `);

    const formatted = transfers.map(t => ({
      ...t,
      id: String(t.id),
      _id: String(t.id),
      sourceWarehouse: { id: t.sourceWarehouseId, name: t.sourceWarehouseName },
      destinationWarehouse: { id: t.destinationWarehouseId, name: t.destinationWarehouseName },
      product: { id: t.productId, name: t.productName, sku: t.sku }
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getStockTransfers error:', err);
    res.status(500).json({ message: 'Error retrieving stock transfers', error: err.message });
  }
};

// Create inter-warehouse transfer with ACID transaction validation & atomic inventory updates
export const createStockTransfer = async (req, res) => {
  const pool = db.getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      product,
      productId,
      sourceWarehouse,
      sourceWarehouseId,
      destinationWarehouse,
      destinationWarehouseId,
      quantity,
      notes = ''
    } = req.body;

    const prodId = parseInt(productId || product, 10);
    const srcId = parseInt(sourceWarehouseId || sourceWarehouse, 10);
    const dstId = parseInt(destinationWarehouseId || destinationWarehouse, 10);
    const qty = parseInt(quantity, 10);

    // Business Rule 1: Validate positive integer quantity
    if (isNaN(qty) || qty <= 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Transfer quantity must be greater than zero' });
    }

    // Business Rule 2: Source and destination warehouses must be different
    if (srcId === dstId) {
      await conn.rollback();
      return res.status(400).json({ message: 'Source and destination warehouses cannot be the same facility' });
    }

    // Business Rule 3: Check source warehouse has sufficient inventory (Row Locking)
    const [srcInv] = await conn.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE;',
      [prodId, srcId]
    );
    const availableSrcStock = srcInv.length > 0 ? srcInv[0].quantity : 0;

    if (availableSrcStock < qty) {
      await conn.rollback();
      return res.status(400).json({
        message: `Insufficient inventory in source warehouse. Available: ${availableSrcStock}, Requested transfer: ${qty}. Negative inventory is prohibited.`
      });
    }

    // Business Rule 4: Atomic deduction from source warehouse
    const newSrcStock = availableSrcStock - qty;
    await conn.query('UPDATE inventory SET quantity = ? WHERE product_id = ? AND warehouse_id = ?;', [newSrcStock, prodId, srcId]);

    // Business Rule 5: Atomic increment at destination warehouse
    const [dstInv] = await conn.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE;',
      [prodId, dstId]
    );
    const prevDstStock = dstInv.length > 0 ? dstInv[0].quantity : 0;
    const newDstStock = prevDstStock + qty;

    await conn.query(`
      INSERT INTO inventory (product_id, warehouse_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
    `, [prodId, dstId, qty]);

    // Create transfer header and item records
    const transferNumber = `TRF-${Date.now().toString().slice(-4)}`;
    const [trfResult] = await conn.query(`
      INSERT INTO stock_transfers (transfer_number, source_warehouse_id, destination_warehouse_id, status, notes)
      VALUES (?, ?, ?, 'Completed', ?);
    `, [transferNumber, srcId, dstId, notes]);

    const transferId = trfResult.insertId;

    await conn.query(`
      INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity)
      VALUES (?, ?, ?);
    `, [transferId, prodId, qty]);

    // Append paired audit ledger records
    await conn.query(`
      INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, previous_stock, new_stock, reference_type, reference_id, notes)
      VALUES 
        (?, ?, 'TRANSFER_OUT', ?, ?, ?, 'STOCK_TRANSFER', ?, ?),
        (?, ?, 'TRANSFER_IN', ?, ?, ?, 'STOCK_TRANSFER', ?, ?);
    `, [
      prodId, srcId, qty, availableSrcStock, newSrcStock, transferNumber, `Dispatched via Transfer #${transferNumber}`,
      prodId, dstId, qty, prevDstStock, newDstStock, transferNumber, `Received via Transfer #${transferNumber}`
    ]);

    await conn.commit();

    res.status(201).json({
      id: String(transferId),
      _id: String(transferId),
      transferNumber,
      sourceWarehouseId: srcId,
      destinationWarehouseId: dstId,
      productId: prodId,
      quantity: qty,
      status: 'Completed',
      notes
    });
  } catch (err) {
    await conn.rollback();
    console.error('createStockTransfer error:', err);
    res.status(500).json({ message: 'Stock transfer failed', error: err.message });
  } finally {
    conn.release();
  }
};
