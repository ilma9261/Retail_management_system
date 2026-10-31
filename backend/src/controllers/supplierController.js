import db from '../config/db.js';

export const getSuppliers = async (req, res) => {
  try {
    const pool = db.getPool();
    const [suppliers] = await pool.query(`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.company_name AS companyName,
        s.email,
        s.phone,
        s.address,
        s.status,
        s.created_at AS createdAt,
        COUNT(p.id) AS suppliedProductsCount
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.id ASC;
    `);

    const formatted = suppliers.map(s => ({
      ...s,
      id: String(s.id),
      _id: String(s.id),
      suppliedProducts: []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving suppliers', error: err.message });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?;', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });

    const s = rows[0];
    res.json({
      ...s,
      id: String(s.id),
      _id: String(s.id),
      companyName: s.company_name
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving supplier', error: err.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const pool = db.getPool();
    const { name, companyName, email, phone, address, status = 'active' } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Supplier contact name and valid email are required' });
    }

    const [existing] = await pool.query('SELECT id FROM suppliers WHERE email = ?;', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'A supplier with this email already exists' });
    }

    const code = `SUP-${Date.now().toString().slice(-4)}`;
    const [result] = await pool.query(`
      INSERT INTO suppliers (code, name, company_name, email, phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `, [code, name.trim(), companyName ? companyName.trim() : name.trim(), email.trim().toLowerCase(), phone || '', address || '', status.toLowerCase()]);

    res.status(201).json({
      id: String(result.insertId),
      _id: String(result.insertId),
      code,
      name: name.trim(),
      companyName: companyName ? companyName.trim() : name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      address,
      status
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create supplier', error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);
    const { name, companyName, email, phone, address, status } = req.body;

    await pool.query(`
      UPDATE suppliers SET
        name = COALESCE(?, name),
        company_name = COALESCE(?, company_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        status = COALESCE(?, status)
      WHERE id = ?;
    `, [
      name ? name.trim() : null,
      companyName ? companyName.trim() : null,
      email ? email.trim().toLowerCase() : null,
      phone !== undefined ? phone : null,
      address !== undefined ? address : null,
      status ? status.toLowerCase() : null,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM suppliers WHERE id = ?;', [id]);
    res.json({
      ...updated[0],
      id: String(id),
      _id: String(id),
      companyName: updated[0].company_name
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update supplier', error: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const pool = db.getPool();
    const id = parseInt(req.params.id, 10);

    // Business rule: Do not delete supplier if active purchase orders exist
    const [poRows] = await pool.query("SELECT id FROM purchase_orders WHERE supplier_id = ? AND status IN ('Pending', 'Approved', 'Draft');", [id]);
    if (poRows.length > 0) {
      return res.status(400).json({ message: `Cannot delete supplier. ${poRows.length} active purchase orders are pending with this vendor.` });
    }

    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?;', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier not found' });

    res.json({ message: 'Supplier deleted successfully', id: String(id) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete supplier', error: err.message });
  }
};
