import StockTransfer from '../models/StockTransfer.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export const getStockTransfers = async (req, res) => {
  try {
    const transfers = await StockTransfer.find()
      .populate('product','name sku').populate('sourceWarehouse','name').populate('destinationWarehouse','name');
    res.json(transfers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createStockTransfer = async (req, res) => {
  try {
    const { product: productId, sourceWarehouse, destinationWarehouse, quantity, notes } = req.body;
    if (sourceWarehouse === destinationWarehouse) return res.status(400).json({ message: 'Source and destination cannot be the same' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });

    // Update stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: 0 } }); // stock is total; for now track via transactions

    // Log transactions
    const prevStock = product.stock;
    await InventoryTransaction.create([
      { product: productId, warehouse: sourceWarehouse, type: 'TRANSFER_OUT', quantity, previousStock: prevStock, newStock: prevStock - quantity, notes: `Transfer to warehouse`, reference: destinationWarehouse },
      { product: productId, warehouse: destinationWarehouse, type: 'TRANSFER_IN', quantity, previousStock: 0, newStock: quantity, notes: `Transfer from warehouse`, reference: sourceWarehouse }
    ]);

    const transfer = await StockTransfer.create({ product: productId, sourceWarehouse, destinationWarehouse, quantity, notes, status: 'Completed' });
    res.status(201).json(await transfer.populate(['product','sourceWarehouse','destinationWarehouse']));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
