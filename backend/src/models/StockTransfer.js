import mongoose from 'mongoose';
const stockTransferSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['Pending','Completed','Cancelled'], default: 'Completed' },
  notes: String,
}, { timestamps: true });
export default mongoose.model('StockTransfer', stockTransferSchema);
