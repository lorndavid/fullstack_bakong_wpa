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
import { validate } from '../middlewares/validate';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receivePurchaseOrderSchema,
} from '../validators';

const router = Router();

// All inventory routes require admin authentication
router.use(protect, authorize('admin'));

// Overview
router.get('/overview', getInventoryOverview);

// Warehouses
router.get('/warehouses', getWarehouses);
router.post('/warehouses', validate(createWarehouseSchema), createWarehouse);
router.put('/warehouses/:id', validate(updateWarehouseSchema), updateWarehouse);
router.delete('/warehouses/:id', deleteWarehouse);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', validate(createSupplierSchema), createSupplier);
router.put('/suppliers/:id', validate(updateSupplierSchema), updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Stock Movements
router.get('/movements', getStockMovements);

// Purchase Orders
router.get('/purchase-orders', getPurchaseOrders);
router.post('/purchase-orders', validate(createPurchaseOrderSchema), createPurchaseOrder);
router.put('/purchase-orders/:id', validate(updatePurchaseOrderSchema), updatePurchaseOrder);
router.post('/purchase-orders/:id/receive', validate(receivePurchaseOrderSchema), receivePurchaseOrder);

export default router;
