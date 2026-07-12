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
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  receivePurchaseOrderSchema,
  mongoIdParam,
  paginationQuery,
} from '../validators';

const router = Router();

// All inventory routes require admin authentication
router.use(protect, authorize('admin'));

// Overview
router.get('/overview', getInventoryOverview);

// Warehouses
router.get('/warehouses', validateQuery(paginationQuery), getWarehouses);
router.post('/warehouses', validate(createWarehouseSchema), createWarehouse);
router.put('/warehouses/:id', validateParams(mongoIdParam), validate(updateWarehouseSchema), updateWarehouse);
router.delete('/warehouses/:id', validateParams(mongoIdParam), deleteWarehouse);

// Suppliers
router.get('/suppliers', validateQuery(paginationQuery), getSuppliers);
router.post('/suppliers', validate(createSupplierSchema), createSupplier);
router.put('/suppliers/:id', validateParams(mongoIdParam), validate(updateSupplierSchema), updateSupplier);
router.delete('/suppliers/:id', validateParams(mongoIdParam), deleteSupplier);

// Stock Movements
router.get('/movements', validateQuery(paginationQuery), getStockMovements);

// Purchase Orders
router.get('/purchase-orders', validateQuery(paginationQuery), getPurchaseOrders);
router.post('/purchase-orders', validate(createPurchaseOrderSchema), createPurchaseOrder);
router.put('/purchase-orders/:id', validateParams(mongoIdParam), validate(updatePurchaseOrderSchema), updatePurchaseOrder);
router.post('/purchase-orders/:id/receive', validateParams(mongoIdParam), validate(receivePurchaseOrderSchema), receivePurchaseOrder);

export default router;
