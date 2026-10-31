import db from '../config/db.js';

// Get all Purchase Orders with populated supplier and target warehouse
export const getPurchaseOrders = async (req, res) => {
  try {
    const pool = db.getPool();
    const [orders] = await pool.query(`
      SELECT 
        po.id,
        po.po_number AS poNumber,
        po.supplier_id AS supplierId,
        po.target_warehouse_id AS targetWarehouseId,
        po.status,
        po.total_amount AS totalAmount,
        po.order_date AS orderDate,
        po.expected_delivery AS expectedDelivery,
        po.received_at AS receivedAt,
        po.notes,
        po.created_at AS createdAt,
        s.company_name AS supplierName,
        w.name AS targetWarehouseName
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN warehouses w ON po.target_warehouse_id = w.id
      ORDER BY po.id DESC;
    `);

    // Fetch items for each order
    const [items] = await pool.query(`
      SELECT 
        poi.id,
        poi.purchase_order_id,
        poi.product_id AS productId,
        poi.quantity,
        poi.unit_price AS unitPrice,
        poi.total_price AS total,
        p.name AS productName,
        p.sku
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id;
    `);

    const itemsMap = {};
    for (const it of items) {
      if (!itemsMap[it.purchase_order_id]) itemsMap[it.purchase_order_id] = [];
      itemsMap[it.purchase_order_id].push({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total
      });
    }

    const formatted = orders.map(po => ({
      ...po,
      id: String(po.id),
      _id: String(po.id),
      supplier: { id: po.supplierId, name: po.supplierName, companyName: po.supplierName },
      targetWarehouse: { id: po.targetWarehouseId, name: po.targetWarehouseName },
      items: itemsMap[po.id] || []
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getPurchaseOrders error:', err);
    res.status(500).json({ message: 'Error retrieving purchase orders', error: err.message });
  }
};

// Get single Purchase Order by ID
export const getPurchaseOrder = async (req, res) => {
  try {
    const pool = db.getPool();
    const poId = parseInt(req.params.id, 10);
    const [orders] = await pool.query(`
      SELECT 
        po.id,
        po.po_number AS poNumber,
        po.supplier_id AS supplierId,
        po.target_warehouse_id AS targetWarehouseId,
        po.status,
        po.total_amount AS totalAmount,
        po.order_date AS orderDate,
        po.expected_delivery AS expectedDelivery,
        po.received_at AS receivedAt,
        po.notes,
        po.created_at AS createdAt,
        s.company_name AS supplierName,
        w.name AS targetWarehouseName
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN warehouses w ON po.target_warehouse_id = w.id
      WHERE po.id = ?;
    `, [poId]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const po = orders[0];
    const [items] = await pool.query(`
      SELECT 
        poi.id,
        poi.purchase_order_id,
        poi.product_id AS productId,
        poi.quantity,
        poi.unit_price AS unitPrice,
        poi.total_price AS total,
        p.name AS productName,
        p.sku
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = ?;
    `, [poId]);

    res.json({
      ...po,
      id: String(po.id),
      _id: String(po.id),
      supplier: { id: po.supplierId, name: po.supplierName, companyName: po.supplierName },
      targetWarehouse: { id: po.targetWarehouseId, name: po.targetWarehouseName },
      items: items.map(it => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total
      }))
    });
  } catch (err) {
    console.error('getPurchaseOrder error:', err);
    res.status(500).json({ message: 'Error retrieving purchase order', error: err.message });
  }
};

// Create new Purchase Order with multiple line items inside an ACID transaction
export const createPurchaseOrder = async (req, res) => {
  const pool = db.getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { supplier, supplierId, targetWarehouse, targetWarehouseId, items = [], expectedDelivery, notes = '', status = 'Pending' } = req.body;
    const finalSupId = parseInt(supplierId || supplier, 10);
    const finalWhId = parseInt(targetWarehouseId || targetWarehouse, 10);

    if (!finalSupId || !finalWhId) {
      await conn.rollback();
      return res.status(400).json({ message: 'Supplier and destination warehouse are required' });
    }

    if (!items || items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Purchase order must contain at least one line item' });
    }

    const calculatedTotal = items.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.unitPrice)), 0);
    const poNumber = `PO-2026-${Date.now().toString().slice(-4)}`;

    const [poResult] = await conn.query(`
      INSERT INTO purchase_orders (po_number, supplier_id, target_warehouse_id, status, total_amount, expected_delivery, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [poNumber, finalSupId, finalWhId, status, calculatedTotal, expectedDelivery || null, notes]);

    const newPOId = poResult.insertId;

    for (const it of items) {
      const prodId = parseInt(it.productId || it.product, 10);
      const qty = parseInt(it.quantity, 10);
      const price = Number(it.unitPrice);
      const lineTotal = qty * price;

      await conn.query(`
        INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?);
      `, [newPOId, prodId, qty, price, lineTotal]);
    }

    await conn.commit();

    res.status(201).json({
      id: String(newPOId),
      _id: String(newPOId),
      poNumber,
      supplierId: finalSupId,
      targetWarehouseId: finalWhId,
      status,
      totalAmount: calculatedTotal,
      items
    });
  } catch (err) {
    await conn.rollback();
    console.error('createPurchaseOrder error:', err);
    res.status(500).json({ message: 'Failed to create purchase order', error: err.message });
  } finally {
    conn.release();
  }
};

// Update Purchase Order Status with ACID Transaction Receiving Logic
export const updatePurchaseOrderStatus = async (req, res) => {
  const pool = db.getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const [poRows] = await conn.query('SELECT * FROM purchase_orders WHERE id = ? FOR UPDATE;', [id]);
    if (poRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    const po = poRows[0];

    // Enforce business rules
    if (po.status === 'Received') {
      await conn.rollback();
      return res.status(400).json({ message: 'Cannot modify a purchase order that has already been received' });
    }
    if (po.status === 'Cancelled') {
      await conn.rollback();
      return res.status(400).json({ message: 'Cannot update a cancelled purchase order' });
    }

    // When status changes to "Received": Atomically increment product and warehouse inventory
    if (status === 'Received') {
      const [items] = await conn.query('SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = ?;', [id]);

      for (const item of items) {
        // Fetch current warehouse inventory
        const [inv] = await conn.query('SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE;', [item.product_id, po.target_warehouse_id]);
        const prevWhStock = inv.length > 0 ? inv[0].quantity : 0;
        const newWhStock = prevWhStock + item.quantity;

        // Upsert inventory
        await conn.query(`
          INSERT INTO inventory (product_id, warehouse_id, quantity)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
        `, [item.product_id, po.target_warehouse_id, item.quantity]);

        // Increment total product stock
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?;', [item.quantity, item.product_id]);

        // Append audit ledger
        await conn.query(`
          INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, previous_stock, new_stock, reference_type, reference_id, notes)
          VALUES (?, ?, 'STOCK_IN', ?, ?, ?, 'PURCHASE_ORDER', ?, ?);
        `, [item.product_id, po.target_warehouse_id, item.quantity, prevWhStock, newWhStock, po.po_number, `Received via PO #${po.po_number}`]);
      }

      await conn.query('UPDATE purchase_orders SET status = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?;', [status, id]);
    } else {
      await conn.query('UPDATE purchase_orders SET status = ? WHERE id = ?;', [status, id]);
    }

    await conn.commit();

    const [updated] = await pool.query('SELECT * FROM purchase_orders WHERE id = ?;', [id]);
    res.json({
      ...updated[0],
      id: String(id),
      _id: String(id)
    });
  } catch (err) {
    await conn.rollback();
    console.error('updatePurchaseOrderStatus error:', err);
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  } finally {
    conn.release();
  }
};

// Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);

    const [po] = await pool.query('SELECT status FROM purchase_orders WHERE id = ?;', [id]);
    if (po.length === 0) return res.status(404).json({ message: 'Purchase order not found' });
    if (po[0].status === 'Received') {
      return res.status(400).json({ message: 'Received purchase orders cannot be deleted because stock ledger has already executed.' });
    }

    await pool.query('DELETE FROM purchase_orders WHERE id = ?;', [id]);
    res.json({ message: 'Purchase order deleted successfully', id: String(id) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete purchase order', error: err.message });
  }
};
