import express from 'express';
import { getInventory, getTransactions, adjustStock } from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getInventory);
router.get('/transactions', protect, getTransactions);
router.post('/adjust', protect, adjustStock);
export default router;
