import { Router } from 'express';
import {
  createPayment,
  checkPayment,
  getTransaction,
  getAllTransactions,
} from '../controllers/paymentController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/transactions', protect, authorize('admin'), getAllTransactions);
router.post('/create', protect, createPayment);
router.get('/check/:transactionId', protect, checkPayment);
router.get('/transaction/:id', protect, getTransaction);

export default router;
