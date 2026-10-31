import express from 'express';
import { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouseController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/').get(protect, getWarehouses).post(protect, createWarehouse);
router.route('/:id').get(protect, getWarehouse).put(protect, updateWarehouse).delete(protect, deleteWarehouse);
export default router;
