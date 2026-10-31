import Warehouse from '../models/Warehouse.js';
import Product from '../models/Product.js';

export const getWarehouses = async (req, res) => {
  try { res.json(await Warehouse.find()); } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getWarehouse = async (req, res) => {
  try {
    const w = await Warehouse.findById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(w);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createWarehouse = async (req, res) => {
  try { res.status(201).json(await Warehouse.create(req.body)); } catch (err) { res.status(400).json({ message: err.message }); }
};

export const updateWarehouse = async (req, res) => {
  try {
    const w = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!w) return res.status(404).json({ message: 'Warehouse not found' });
    res.json(w);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const hasStock = await Product.exists({ warehouse: req.params.id, stock: { $gt: 0 } });
    if (hasStock) return res.status(400).json({ message: 'Cannot delete warehouse with active inventory' });
    const w = await Warehouse.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ message: 'Warehouse not found' });
    res.json({ message: 'Warehouse deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
