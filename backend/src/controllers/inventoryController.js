import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Warehouse from '../models/Warehouse.js';

export const getInventory = async (req, res) => {
  try {
    const products = await Product.find().populate('supplier','name companyName').populate('warehouse','name location');
    res.json(products);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getTransactions = async (req, res) => {
  try {
    const txns = await InventoryTransaction.find()
      .sort({ createdAt: -1 }).limit(200)
      .populate('product','name sku').populate('warehouse','name');
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const adjustStock = async (req, res) => {
  try {
    const { productId, warehouseId, quantity, type, notes } = req.body;
    const qty = Number(quantity);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

    let newStock = product.stock;
    if (type === 'STOCK_IN') newStock = product.stock + qty;
    else if (type === 'STOCK_OUT') {
      if (product.stock < qty) return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
      newStock = product.stock - qty;
    } else if (type === 'ADJUSTMENT') {
      newStock = product.stock + qty;
      if (newStock < 0) return res.status(400).json({ message: 'Stock cannot go below zero' });
    }

    await Product.findByIdAndUpdate(productId, { stock: newStock });
    await InventoryTransaction.create({
      product: productId, warehouse: warehouseId, type,
      quantity: qty, previousStock: product.stock, newStock, notes
    });

    res.json({ message: 'Stock updated', newStock });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
