import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const getSuppliers = async (req, res) => {
  try { res.json(await Supplier.find()); } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getSupplier = async (req, res) => {
  try {
    const s = await Supplier.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Supplier not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createSupplier = async (req, res) => {
  try { res.status(201).json(await Supplier.create(req.body)); } catch (err) { res.status(400).json({ message: err.message }); }
};

export const updateSupplier = async (req, res) => {
  try {
    const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Supplier not found' });
    res.json(s);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const deleteSupplier = async (req, res) => {
  try {
    const hasPending = await PurchaseOrder.exists({ supplier: req.params.id, status: { $in: ['Pending','Approved','Draft'] } });
    if (hasPending) return res.status(400).json({ message: 'Cannot delete supplier with active purchase orders' });
    const s = await Supplier.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
