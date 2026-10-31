import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String },
    description: { type: String },
    category: { type: String },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
