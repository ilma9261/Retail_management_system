import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('supplier','name companyName').populate('warehouse','name location');
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier').populate('warehouse');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (product.stock > 0 && req.body.warehouseId) {
      await InventoryTransaction.create({
        product: product._id, warehouse: req.body.warehouseId || req.body.warehouse,
        type: 'STOCK_IN', quantity: product.stock, previousStock: 0, newStock: product.stock,
        notes: 'Initial stock on product creation'
      });
    }
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
