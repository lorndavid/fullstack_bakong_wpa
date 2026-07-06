import { Router } from 'express';
import {
  getInventoryOverview,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getStockMovements,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
} from '../controllers/inventoryController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// All inventory routes require admin authentication
router.use(protect, authorize('admin'));

// Overview
router.get('/overview', getInventoryOverview);

// Warehouses
router.get('/warehouses', getWarehouses);
router.post('/warehouses', createWarehouse);
router.put('/warehouses/:id', updateWarehouse);
router.delete('/warehouses/:id', deleteWarehouse);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', createSupplier);
router.put('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Stock Movements
router.get('/movements', getStockMovements);

// Purchase Orders
router.get('/purchase-orders', getPurchaseOrders);
router.post('/purchase-orders', createPurchaseOrder);
router.put('/purchase-orders/:id', updatePurchaseOrder);
router.post('/purchase-orders/:id/receive', receivePurchaseOrder);

export default router;
