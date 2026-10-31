import db from '../config/db.js';

export const getWarehouses = async (req, res) => {
  try {
    const pool = db.getPool();
    const [warehouses] = await pool.query(`
      SELECT 
        w.id,
        w.code,
        w.name,
        w.location,
        w.manager_name AS managerName,
        w.contact_number AS contactNumber,
        w.storage_capacity AS storageCapacity,
        w.status,
        w.created_at AS createdAt,
        COALESCE(SUM(i.quantity), 0) AS currentStockUnits
      FROM warehouses w
      LEFT JOIN inventory i ON w.id = i.warehouse_id
      GROUP BY w.id
      ORDER BY w.id ASC;
    `);

    const formatted = warehouses.map(w => ({
      ...w,
      id: String(w.id),
      _id: String(w.id),
      occupancyRate: w.storageCapacity ? Math.min(100, Math.round((w.currentStockUnits / w.storageCapacity) * 100)) : 0
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving warehouses', error: err.message });
  }
};

export const getWarehouse = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT * FROM warehouses WHERE id = ?;', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Warehouse not found' });

    const w = rows[0];
    res.json({
      ...w,
      id: String(w.id),
      _id: String(w.id),
      managerName: w.manager_name,
      contactNumber: w.contact_number,
      storageCapacity: w.storage_capacity
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving warehouse', error: err.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const pool = db.getPool();
    const { name, location, managerName, contactNumber, storageCapacity = 20000, capacity, status = 'active' } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: 'Warehouse name and location are required' });
    }

    const code = `WH-${Date.now().toString().slice(-4)}`;
    const [result] = await pool.query(`
      INSERT INTO warehouses (code, name, location, manager_name, contact_number, storage_capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [code, name.trim(), location.trim(), managerName || '', contactNumber || '', Number(storageCapacity || capacity) || 20000, status.toLowerCase()]);

    res.status(201).json({
      id: String(result.insertId),
      _id: String(result.insertId),
      code,
      name: name.trim(),
      location: location.trim(),
      managerName,
      contactNumber,
      storageCapacity: Number(storageCapacity || capacity),
      currentStockUnits: 0,
      status
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create warehouse', error: err.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);
    const { name, location, managerName, contactNumber, storageCapacity, capacity, status } = req.body;

    await pool.query(`
      UPDATE warehouses SET
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        manager_name = COALESCE(?, manager_name),
        contact_number = COALESCE(?, contact_number),
        storage_capacity = COALESCE(?, storage_capacity),
        status = COALESCE(?, status)
      WHERE id = ?;
    `, [
      name ? name.trim() : null,
      location ? location.trim() : null,
      managerName !== undefined ? managerName : null,
      contactNumber !== undefined ? contactNumber : null,
      (storageCapacity || capacity) !== undefined ? Number(storageCapacity || capacity) : null,
      status ? status.toLowerCase() : null,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM warehouses WHERE id = ?;', [id]);
    res.json({
      ...updated[0],
      id: String(id),
      _id: String(id),
      managerName: updated[0].manager_name,
      contactNumber: updated[0].contact_number,
      storageCapacity: updated[0].storage_capacity
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update warehouse', error: err.message });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);

    // Business rule: Do not delete warehouse if active inventory exists in it
    const [invRows] = await pool.query('SELECT SUM(quantity) AS total FROM inventory WHERE warehouse_id = ?;', [id]);
    const totalUnits = invRows[0]?.total || 0;
    if (totalUnits > 0) {
      return res.status(400).json({ message: `Cannot delete warehouse. It currently holds ${totalUnits} active inventory units. Relocate stock first.` });
    }

    const [result] = await pool.query('DELETE FROM warehouses WHERE id = ?;', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Warehouse not found' });

    res.json({ message: 'Warehouse deleted successfully', id: String(id) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete warehouse', error: err.message });
  }
};
