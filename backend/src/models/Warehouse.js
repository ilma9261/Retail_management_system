import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    managerName: { type: String },
    contactNumber: { type: String },
    capacity: { type: Number, default: 0 },
    currentStockUnits: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('Warehouse', warehouseSchema);
