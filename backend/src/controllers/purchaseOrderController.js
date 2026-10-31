import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

export const getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier','name companyName email')
      .populate('targetWarehouse','name location')
      .populate('items.product','name sku');
    res.json(pos);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('supplier').populate('targetWarehouse').populate('items.product');
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(po);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { items = [], ...rest } = req.body;
    const totalAmount = items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.unitPrice)), 0);
    const itemsWithTotal = items.map(it => ({ ...it, total: Number(it.quantity) * Number(it.unitPrice) }));
    const po = await PurchaseOrder.create({ ...rest, items: itemsWithTotal, totalAmount });
    res.status(201).json(po);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findById(req.params.id).populate('items.product');
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });
    if (po.status === 'Received') return res.status(400).json({ message: 'Order already received' });
    if (po.status === 'Cancelled') return res.status(400).json({ message: 'Order is cancelled' });

    if (status === 'Received') {
      // Update stock for each line item
      for (const item of po.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;
        const prevStock = product.stock;
        const newStock = prevStock + item.quantity;
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        await InventoryTransaction.create({
          product: item.product, warehouse: po.targetWarehouse,
          type: 'STOCK_IN', quantity: item.quantity,
          previousStock: prevStock, newStock,
          notes: `Received from PO #${po._id}`, reference: po._id.toString()
        });
      }
      po.receivedAt = new Date();
    }

    po.status = status;
    await po.save();
    res.json(po);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'PO not found' });
    if (po.status === 'Received') return res.status(400).json({ message: 'Cannot delete received orders' });
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase order deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
