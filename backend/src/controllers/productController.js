import db from '../config/db.js';

// Get all products with populated category, supplier, warehouse, and per-warehouse inventory breakdown
export const getProducts = async (req, res) => {
  try {
    const pool = db.getPool();
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.purchase_price AS purchasePrice,
        p.selling_price AS sellingPrice,
        p.stock,
        p.min_stock_level AS minStockLevel,
        p.image_url AS imageUrl,
        p.created_at AS createdAt,
        c.name AS category,
        c.id AS categoryId,
        s.id AS supplierId,
        s.company_name AS supplierName,
        w.id AS warehouseId,
        w.name AS warehouseName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN warehouses w ON p.primary_warehouse_id = w.id
      ORDER BY p.id DESC;
    `);

    // Fetch warehouseStock map for each product
    const [inventoryRows] = await pool.query('SELECT product_id, warehouse_id, quantity FROM inventory;');
    const invMap = {};
    for (const row of inventoryRows) {
      if (!invMap[row.product_id]) invMap[row.product_id] = {};
      invMap[row.product_id][row.warehouse_id] = row.quantity;
    }

    const formatted = products.map(p => ({
      ...p,
      id: String(p.id),
      _id: String(p.id),
      warehouseStock: invMap[p.id] || { [p.warehouseId || 1]: p.stock },
      supplier: { id: p.supplierId, name: p.supplierName, companyName: p.supplierName },
      warehouse: { id: p.warehouseId, name: p.warehouseName }
    }));

    res.json(formatted);
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ message: 'Error retrieving products', error: err.message });
  }
};

// Get single product by ID
export const getProduct = async (req, res) => {
  try {
    const pool = db.getPool();
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.name AS category_name,
        s.company_name AS supplier_name,
        w.name AS warehouse_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN warehouses w ON p.primary_warehouse_id = w.id
      WHERE p.id = ?;
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = rows[0];
    const [invRows] = await pool.query('SELECT warehouse_id, quantity FROM inventory WHERE product_id = ?;', [p.id]);
    const warehouseStock = {};
    for (const r of invRows) warehouseStock[r.warehouse_id] = r.quantity;

    res.json({
      ...p,
      id: String(p.id),
      _id: String(p.id),
      purchasePrice: p.purchase_price,
      sellingPrice: p.selling_price,
      minStockLevel: p.min_stock_level,
      category: p.category_name,
      warehouseStock
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving product', error: err.message });
  }
};

// Create product with automatic SKU check, primary warehouse assignment, and inventory ledger entry
export const createProduct = async (req, res) => {
  const pool = db.getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      name,
      sku,
      category,
      categoryId,
      purchasePrice = 0,
      sellingPrice = 0,
      stock = 0,
      minStock = 10,
      minStockLevel,
      supplier,
      supplierId,
      warehouse,
      warehouseId,
      description = ''
    } = req.body;

    if (!name || !sku) {
      await conn.rollback();
      return res.status(400).json({ message: 'Product name and unique SKU are required' });
    }

    // Check duplicate SKU
    const [existing] = await conn.query('SELECT id FROM products WHERE sku = ?', [sku.trim().toUpperCase()]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: `SKU "${sku}" is already in use by another product` });
    }

    // Resolve category ID
    let finalCatId = categoryId || null;
    if (!finalCatId && category) {
      const [catRows] = await conn.query('SELECT id FROM categories WHERE name = ?', [category.trim()]);
      if (catRows.length > 0) {
        finalCatId = catRows[0].id;
      } else {
        const [catIns] = await conn.query('INSERT INTO categories (name) VALUES (?)', [category.trim()]);
        finalCatId = catIns.insertId;
      }
    }

    const finalWhId = warehouseId || (warehouse ? parseInt(warehouse, 10) : 1);
    const finalSupId = supplierId || (supplier ? parseInt(supplier, 10) : null);
    const finalStock = Number(stock) || 0;
    const finalMinStock = Number(minStockLevel || minStock) || 10;

    const [prodResult] = await conn.query(`
      INSERT INTO products (
        sku, name, description, category_id, purchase_price, selling_price, stock, min_stock_level, supplier_id, primary_warehouse_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      sku.trim().toUpperCase(),
      name.trim(),
      description,
      finalCatId,
      Number(purchasePrice),
      Number(sellingPrice),
      finalStock,
      finalMinStock,
      finalSupId,
      finalWhId
    ]);

    const newProductId = prodResult.insertId;

    // Record inventory distribution in designated warehouse
    if (finalWhId) {
      await conn.query(`
        INSERT INTO inventory (product_id, warehouse_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
      `, [newProductId, finalWhId, finalStock]);

      // Record initial audit transaction
      if (finalStock > 0) {
        await conn.query(`
          INSERT INTO inventory_transactions (product_id, warehouse_id, type, quantity, previous_stock, new_stock, notes)
          VALUES (?, ?, 'STOCK_IN', ?, 0, ?, 'Initial catalog stock allocation');
        `, [newProductId, finalWhId, finalStock, finalStock]);
      }
    }

    await conn.commit();

    res.status(201).json({
      id: String(newProductId),
      _id: String(newProductId),
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category || 'General',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      stock: finalStock,
      minStockLevel: finalMinStock,
      warehouseStock: { [finalWhId]: finalStock }
    });
  } catch (err) {
    await conn.rollback();
    console.error('createProduct error:', err);
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  } finally {
    conn.release();
  }
};

// Update existing product
export const updateProduct = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);
    const { name, purchasePrice, sellingPrice, minStockLevel, minStock, description, category } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let catId = existing[0].category_id;
    if (category) {
      const [cats] = await pool.query('SELECT id FROM categories WHERE name = ?', [category.trim()]);
      if (cats.length > 0) catId = cats[0].id;
    }

    await pool.query(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        min_stock_level = COALESCE(?, min_stock_level),
        category_id = COALESCE(?, category_id)
      WHERE id = ?;
    `, [
      name ? name.trim() : null,
      description !== undefined ? description : null,
      purchasePrice !== undefined ? Number(purchasePrice) : null,
      sellingPrice !== undefined ? Number(sellingPrice) : null,
      (minStockLevel || minStock) !== undefined ? Number(minStockLevel || minStock) : null,
      catId,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({
      ...updated[0],
      id: String(id),
      _id: String(id),
      purchasePrice: updated[0].purchase_price,
      sellingPrice: updated[0].selling_price,
      minStockLevel: updated[0].min_stock_level
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);

    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: String(id) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
