import mongoose from 'mongoose';
const poItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: Number,
});
const purchaseOrderSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  targetWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status: { type: String, enum: ['Draft','Pending','Approved','Received','Cancelled'], default: 'Draft' },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: { type: Date },
  receivedAt: { type: Date },
  notes: String,
  items: [poItemSchema],
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
