import mongoose from 'mongoose';
const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type: { type: String, enum: ['STOCK_IN','STOCK_OUT','ADJUSTMENT','TRANSFER_IN','TRANSFER_OUT'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 },
  notes: String,
  reference: String,
}, { timestamps: true });
export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
