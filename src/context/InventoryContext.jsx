import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  productsApi,
  warehousesApi,
  suppliersApi,
  purchaseOrdersApi,
  stockTransfersApi,
  inventoryApi,
  dashboardApi,
} from '../services/apiService';
import { useToast } from './ToastContext';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { addToast } = useToast();

  // ── State ────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [settings, setSettings] = useState({
    storeName: 'RetailFlow',
    currency: 'INR',
    lowStockThreshold: 20,
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Load all data on mount ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, whs, sups, pos, txns, trfs, stats] = await Promise.allSettled([
        productsApi.getAll(),
        warehousesApi.getAll(),
        suppliersApi.getAll(),
        purchaseOrdersApi.getAll(),
        inventoryApi.getTransactions(),
        stockTransfersApi.getAll(),
        dashboardApi.getStats(),
      ]);

      if (prods.status === 'fulfilled') setProducts(prods.value);
      if (whs.status === 'fulfilled') setWarehouses(whs.value);
      if (sups.status === 'fulfilled') setSuppliers(sups.value);
      if (pos.status === 'fulfilled') setPurchaseOrders(pos.value);
      if (txns.status === 'fulfilled') setTransactions(txns.value);
      if (trfs.status === 'fulfilled') setTransfers(trfs.value);
      if (stats.status === 'fulfilled') setDashboardStats(stats.value);
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Computed stats (from dashboardStats or derived locally if not yet loaded) ─
  const stats = useMemo(() => {
    if (dashboardStats) return dashboardStats;

    // Fallback local computation (same as before)
    const totalProducts = products.length;
    const totalStockUnits = products.reduce((a, p) => a + (p.stock || 0), 0);
    const totalStockValue = products.reduce((a, p) => a + (p.stock || 0) * (p.purchasePrice || 0), 0);
    const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStock || p.minStockLevel || 20));
    const outOfStockProducts = products.filter(p => (p.stock || 0) <= 0);
    const pendingPurchaseOrders = purchaseOrders.filter(po => ['Pending','Approved','Draft'].includes(po.status)).length;

    const catMap = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { category: cat, count: 0, units: 0, value: 0 };
      catMap[cat].count++;
      catMap[cat].units += p.stock || 0;
      catMap[cat].value += (p.stock || 0) * (p.purchasePrice || 0);
    });

    return {
      totalProducts, totalStockUnits, totalStockValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalWarehouses: warehouses.length,
      totalSuppliers: suppliers.length,
      pendingPurchaseOrders,
      lowStockProducts, outOfStockProducts,
      categoryBreakdown: Object.values(catMap),
      monthlyMovement: [],
      warehouseBreakdown: warehouses,
    };
  }, [dashboardStats, products, warehouses, suppliers, purchaseOrders]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PRODUCT OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addProduct = async (productData) => {
    try {
      const payload = {
        name: productData.name?.trim(),
        sku: productData.sku?.trim().toUpperCase(),
        category: productData.category?.trim(),
        description: productData.description || '',
        purchasePrice: Number(productData.purchasePrice) || 0,
        sellingPrice: Number(productData.sellingPrice) || 0,
        minStock: Number(productData.minStockLevel || productData.minStock) || 10,
        stock: Number(productData.initialStock || productData.stock) || 0,
        supplier: productData.supplierId || productData.supplier || undefined,
        warehouse: productData.warehouseId || productData.warehouse || undefined,
      };
      const created = await productsApi.create(payload);
      setProducts(prev => [created, ...prev]);
      addToast(`Product "${created.name}" created successfully!`, 'success');
      return created;
    } catch (err) {
      addToast(`Failed to create product: ${err.message}`, 'error');
      return null;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const updated = await productsApi.update(id, updatedFields);
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? updated : p));
      addToast('Product details updated successfully!', 'success');
    } catch (err) {
      addToast(`Failed to update product: ${err.message}`, 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => (p._id !== id && p.id !== id)));
      addToast('Product deleted.', 'info');
    } catch (err) {
      addToast(`Failed to delete product: ${err.message}`, 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // INVENTORY / STOCK ADJUSTMENT
  // ─────────────────────────────────────────────────────────────────────────────
  const adjustStock = async ({ productId, warehouseId, quantity, type, notes }) => {
    try {
      const result = await inventoryApi.adjustStock({ productId, warehouseId, quantity: Number(quantity), type, notes });
      // Refresh products to reflect new stock
      const updated = await productsApi.getAll();
      setProducts(updated);
      const txns = await inventoryApi.getTransactions();
      setTransactions(txns);
      addToast(`Inventory adjusted. New stock: ${result.newStock}`, 'success');
      return true;
    } catch (err) {
      addToast(`Stock adjustment failed: ${err.message}`, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // WAREHOUSE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addWarehouse = async (whData) => {
    try {
      const created = await warehousesApi.create({
        name: whData.name?.trim(),
        location: whData.location?.trim(),
        managerName: whData.managerName?.trim(),
        contactNumber: whData.contactNumber?.trim(),
        capacity: Number(whData.storageCapacity || whData.capacity) || 20000,
        status: (whData.status || 'active').toLowerCase(),
      });
      setWarehouses(prev => [...prev, created]);
      addToast(`Warehouse "${created.name}" added successfully!`, 'success');
      return created;
    } catch (err) {
      addToast(`Failed to add warehouse: ${err.message}`, 'error');
      return null;
    }
  };

  const updateWarehouse = async (id, whData) => {
    try {
      const updated = await warehousesApi.update(id, whData);
      setWarehouses(prev => prev.map(w => (w._id === id || w.id === id) ? updated : w));
      addToast('Warehouse updated successfully!', 'success');
    } catch (err) {
      addToast(`Failed to update warehouse: ${err.message}`, 'error');
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      await warehousesApi.delete(id);
      setWarehouses(prev => prev.filter(w => w._id !== id && w.id !== id));
      addToast('Warehouse deleted.', 'info');
      return true;
    } catch (err) {
      addToast(`Failed to delete warehouse: ${err.message}`, 'error');
      return false;
    }
  };

  const transferStock = async ({ sourceWarehouseId, destWarehouseId, productId, quantity, notes }) => {
    if (sourceWarehouseId === destWarehouseId) {
      addToast('Source and destination cannot be the same.', 'error');
      return false;
    }
    try {
      const transfer = await stockTransfersApi.create({
        product: productId,
        sourceWarehouse: sourceWarehouseId,
        destinationWarehouse: destWarehouseId,
        quantity: Number(quantity),
        notes,
      });
      setTransfers(prev => [transfer, ...prev]);
      // Refresh product stock
      const updated = await productsApi.getAll();
      setProducts(updated);
      const src = warehouses.find(w => w._id === sourceWarehouseId || w.id === sourceWarehouseId);
      const dst = warehouses.find(w => w._id === destWarehouseId || w.id === destWarehouseId);
      addToast(`Transferred ${quantity} units from ${src?.name} to ${dst?.name}.`, 'success');
      return true;
    } catch (err) {
      addToast(`Transfer failed: ${err.message}`, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPLIER OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const addSupplier = async (supData) => {
    try {
      const created = await suppliersApi.create({
        name: supData.name?.trim(),
        companyName: supData.companyName?.trim(),
        email: supData.email?.trim(),
        phone: supData.phone?.trim(),
        address: supData.address?.trim(),
        status: (supData.status || 'active').toLowerCase(),
      });
      setSuppliers(prev => [...prev, created]);
      addToast(`Supplier "${created.companyName || created.name}" added successfully!`, 'success');
      return created;
    } catch (err) {
      addToast(`Failed to add supplier: ${err.message}`, 'error');
      return null;
    }
  };

  const updateSupplier = async (id, supData) => {
    try {
      const updated = await suppliersApi.update(id, supData);
      setSuppliers(prev => prev.map(s => (s._id === id || s.id === id) ? updated : s));
      addToast('Supplier details updated successfully!', 'success');
    } catch (err) {
      addToast(`Failed to update supplier: ${err.message}`, 'error');
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await suppliersApi.delete(id);
      setSuppliers(prev => prev.filter(s => s._id !== id && s.id !== id));
      addToast('Supplier deleted.', 'info');
      return true;
    } catch (err) {
      addToast(`Failed to delete supplier: ${err.message}`, 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const createPurchaseOrder = async (poData) => {
    if (!poData.items?.length) {
      addToast('Purchase order must contain at least one item.', 'error');
      return null;
    }
    try {
      const created = await purchaseOrdersApi.create({
        supplier: poData.supplierId || poData.supplier,
        targetWarehouse: poData.targetWarehouseId || poData.targetWarehouse,
        status: poData.status || 'Draft',
        expectedDelivery: poData.expectedDelivery,
        notes: poData.notes || '',
        items: poData.items.map(it => ({
          product: it.productId || it.product,
          productName: it.productName || '',
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      });
      setPurchaseOrders(prev => [created, ...prev]);
      addToast(`Purchase Order created successfully!`, 'success');
      return created;
    } catch (err) {
      addToast(`Failed to create purchase order: ${err.message}`, 'error');
      return null;
    }
  };

  const updatePurchaseOrderStatus = async (id, newStatus) => {
    try {
      const updated = await purchaseOrdersApi.updateStatus(id, newStatus);
      setPurchaseOrders(prev => prev.map(po => (po._id === id || po.id === id) ? updated : po));
      // If received, refresh product stock
      if (newStatus === 'Received') {
        const prods = await productsApi.getAll();
        setProducts(prods);
      }
      addToast(`Purchase Order status changed to ${newStatus}.`, 'info');
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const cancelPurchaseOrder = async (id) => {
    return updatePurchaseOrderStatus(id, 'Cancelled');
  };

  const receivePurchaseOrder = async (id) => {
    return updatePurchaseOrderStatus(id, 'Received');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────────────────────────────────────
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('Settings updated successfully!', 'success');
  };

  const resetToDemo = async () => {
    addToast('Refreshing data from server...', 'info');
    await loadAll();
  };

  const importDatabase = () => {
    addToast('Import is not available in live API mode.', 'info');
    return false;
  };

  return (
    <InventoryContext.Provider value={{
      products, warehouses, suppliers, purchaseOrders,
      transactions, transfers, settings, stats,
      loading, dataLoaded,
      addProduct, updateProduct, deleteProduct,
      adjustStock,
      addWarehouse, updateWarehouse, deleteWarehouse,
      transferStock,
      addSupplier, updateSupplier, deleteSupplier,
      createPurchaseOrder, updatePurchaseOrderStatus,
      cancelPurchaseOrder, receivePurchaseOrder,
      updateSettings, resetToDemo, importDatabase,
      refresh: loadAll,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
