import express from 'express';
import { getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrderStatus, deletePurchaseOrder } from '../controllers/purchaseOrderController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/').get(protect, getPurchaseOrders).post(protect, createPurchaseOrder);
router.route('/:id').get(protect, getPurchaseOrder).delete(protect, deletePurchaseOrder);
router.patch('/:id/status', protect, updatePurchaseOrderStatus);
export default router;
