import express from 'express';
import { getStockTransfers, createStockTransfer } from '../controllers/stockTransferController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/').get(protect, getStockTransfers).post(protect, createStockTransfer);
export default router;
