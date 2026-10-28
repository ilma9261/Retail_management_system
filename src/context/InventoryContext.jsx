import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storageService';
import { useToast } from './ToastContext';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  INITIAL_SETTINGS
} from '../services/mockData';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { addToast } = useToast();

  // Initialize storage on first run if empty
  useEffect(() => {
    storageService.initializeStorage(false);
  }, []);

  // Application Data States
  const [products, setProducts] = useState(() => storageService.get(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [warehouses, setWarehouses] = useState(() => storageService.get(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES));
  const [suppliers, setSuppliers] = useState(() => storageService.get(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS));
  const [purchaseOrders, setPurchaseOrders] = useState(() => storageService.get(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS));
  const [transactions, setTransactions] = useState(() => storageService.get(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS));
  const [transfers, setTransfers] = useState(() => storageService.get(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS));
  const [settings, setSettings] = useState(() => storageService.get(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));

  // Sync state changes with localStorage
  useEffect(() => {
    storageService.set(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.WAREHOUSES, warehouses);
  }, [warehouses]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.SUPPLIERS, suppliers);
  }, [suppliers]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.TRANSFERS, transfers);
  }, [transfers]);

  useEffect(() => {
    storageService.set(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // ==========================================
  // COMPUTED REAL-TIME METRICS & STATISTICS
  // ==========================================
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.stock) || 0) * (Number(p.purchasePrice) || 0), 0);
    const lowStockProducts = products.filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= (Number(p.minStockLevel) || settings.lowStockThreshold || 20));
    const outOfStockProducts = products.filter(p => (Number(p.stock) || 0) <= 0);
    const totalWarehousesCount = warehouses.length;
    const totalSuppliersCount = suppliers.length;
    const pendingPurchaseOrders = purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Approved').length;

    // Category breakdown
    const categoryMap = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, count: 0, units: 0, value: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].units += (Number(p.stock) || 0);
      categoryMap[cat].value += (Number(p.stock) || 0) * (Number(p.purchasePrice) || 0);
    });
    const categoryBreakdown = Object.values(categoryMap);

    // Warehouse breakdown
    const warehouseBreakdown = warehouses.map(wh => {
      let whUnits = 0;
      let whValue = 0;
      products.forEach(p => {
        const qty = Number(p.warehouseStock?.[wh.id]) || 0;
        whUnits += qty;
        whValue += qty * (Number(p.purchasePrice) || 0);
      });
      const occupancyRate = wh.storageCapacity ? Math.min(100, Math.round((whUnits / wh.storageCapacity) * 100)) : 0;
      return {
        ...wh,
        currentStockUnits: whUnits,
        totalValue: whValue,
        occupancyRate
      };
    });

    // Monthly movement from transactions
    const movementByMonth = {};
    transactions.forEach(t => {
      const date = new Date(t.date || Date.now());
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      if (!movementByMonth[monthKey]) {
        movementByMonth[monthKey] = { month: monthKey, stockIn: 0, stockOut: 0 };
      }
      if (t.type === 'STOCK_IN') {
        movementByMonth[monthKey].stockIn += Math.abs(Number(t.quantity) || 0);
      } else if (t.type === 'STOCK_OUT') {
        movementByMonth[monthKey].stockOut += Math.abs(Number(t.quantity) || 0);
      }
    });
    const monthlyMovement = Object.values(movementByMonth);

    return {
      totalProducts,
      totalStockUnits,
      totalStockValue,
      lowStockProducts,
      outOfStockProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalWarehouses: totalWarehousesCount,
      totalSuppliers: totalSuppliersCount,
      pendingPurchaseOrders,
      categoryBreakdown,
      warehouseBreakdown,
      monthlyMovement
    };
  }, [products, warehouses, suppliers, purchaseOrders, transactions, settings]);

  // ==========================================
  // PRODUCT OPERATIONS
  // ==========================================
  const addProduct = (productData) => {
    const newId = `PRD-${1000 + products.length + Math.floor(Math.random() * 800) + 1}`;
    
    // Distribute stock to designated warehouse
    const primaryWhId = productData.warehouseId || warehouses[0]?.id || 'WH-001';
    const initStock = Number(productData.initialStock) || 0;
    const warehouseStock = {
      [primaryWhId]: initStock
    };

    const newProduct = {
      id: newId,
      name: productData.name.trim(),
      sku: productData.sku.trim().toUpperCase(),
      category: productData.category.trim(),
      description: productData.description || '',
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      minStockLevel: Number(productData.minStockLevel) || 10,
      supplierId: productData.supplierId || suppliers[0]?.id || '',
      warehouseId: primaryWhId,
      warehouseStock,
      stock: initStock,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);

    // Record initial stock transaction if positive
    if (initStock > 0) {
      const initialTxn = {
        id: `TXN-${Date.now().toString().slice(-6)}`,
        productId: newId,
        productName: newProduct.name,
        warehouseId: primaryWhId,
        warehouseName: warehouses.find(w => w.id === primaryWhId)?.name || 'Primary Warehouse',
        type: 'STOCK_IN',
        quantity: initStock,
        previousStock: 0,
        updatedStock: initStock,
        date: new Date().toISOString(),
        notes: 'Initial inventory deposit on product creation.'
      };
      setTransactions(prev => [initialTxn, ...prev]);
    }

    addToast(`Product "${newProduct.name}" created successfully!`, 'success');
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        ...updatedFields,
        purchasePrice: Number(updatedFields.purchasePrice ?? p.purchasePrice),
        sellingPrice: Number(updatedFields.sellingPrice ?? p.sellingPrice),
        minStockLevel: Number(updatedFields.minStockLevel ?? p.minStockLevel),
        updatedAt: new Date().toISOString()
      };
    }));
    addToast('Product details updated successfully!', 'success');
  };

  const deleteProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast(`Product "${product.name}" deleted.`, 'info');
  };

  // ==========================================
  // INVENTORY STOCK ADJUSTMENT (IN, OUT, ADJUST)
  // ==========================================
  const adjustStock = ({ productId, warehouseId, quantity, type, notes }) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      addToast('Product not found.', 'error');
      return false;
    }

    const targetWarehouse = warehouses.find(w => w.id === warehouseId);
    if (!targetWarehouse) {
      addToast('Warehouse not found.', 'error');
      return false;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty === 0) {
      addToast('Please provide a valid non-zero quantity.', 'error');
      return false;
    }

    const currentWhStock = Number(targetProduct.warehouseStock?.[warehouseId]) || 0;
    const currentTotalStock = Number(targetProduct.stock) || 0;
    let newWhStock = currentWhStock;
    let newTotalStock = currentTotalStock;
    let txnQty = qty;

    if (type === 'STOCK_IN') {
      if (qty <= 0) {
        addToast('Stock in quantity must be greater than zero.', 'error');
        return false;
      }
      newWhStock = currentWhStock + qty;
      newTotalStock = currentTotalStock + qty;
      txnQty = qty;
    } else if (type === 'STOCK_OUT') {
      if (qty <= 0) {
        addToast('Stock out quantity must be greater than zero.', 'error');
        return false;
      }
      if (currentWhStock < qty) {
        addToast(`Insufficient stock in ${targetWarehouse.name}. Available: ${currentWhStock}, requested deduction: ${qty}. Negative stock is prohibited.`, 'error');
        return false;
      }
      newWhStock = currentWhStock - qty;
      newTotalStock = Math.max(0, currentTotalStock - qty);
      txnQty = qty;
    } else if (type === 'ADJUSTMENT') {
      // Direct adjustment quantity can be positive or negative
      const resultingWhStock = currentWhStock + qty;
      if (resultingWhStock < 0) {
        addToast(`Adjustment cannot cause stock to drop below zero. Resulting stock would be ${resultingWhStock}.`, 'error');
        return false;
      }
      newWhStock = resultingWhStock;
      newTotalStock = Math.max(0, currentTotalStock + qty);
      txnQty = qty;
    }

    // Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const updatedWhStock = {
        ...(p.warehouseStock || {}),
        [warehouseId]: newWhStock
      };
      // Recalculate true total stock
      const updatedTotal = Object.values(updatedWhStock).reduce((a, b) => a + (Number(b) || 0), 0);
      return {
        ...p,
        warehouseStock: updatedWhStock,
        stock: updatedTotal
      };
    }));

    // Record Transaction
    const newTxn = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      productId,
      productName: targetProduct.name,
      warehouseId,
      warehouseName: targetWarehouse.name,
      type,
      quantity: txnQty,
      previousStock: currentWhStock,
      updatedStock: newWhStock,
      date: new Date().toISOString(),
      notes: notes || `Manual ${type.replace('_', ' ')} processed.`
    };

    setTransactions(prev => [newTxn, ...prev]);
    addToast(`Inventory updated for "${targetProduct.name}" in ${targetWarehouse.name}.`, 'success');
    return true;
  };

  // ==========================================
  // WAREHOUSE OPERATIONS & STOCK TRANSFERS
  // ==========================================
  const addWarehouse = (whData) => {
    const newId = `WH-00${warehouses.length + 1}`;
    const newWarehouse = {
      id: newId,
      name: whData.name.trim(),
      location: whData.location.trim(),
      managerName: whData.managerName.trim(),
      contactNumber: whData.contactNumber.trim(),
      storageCapacity: Number(whData.storageCapacity) || 20000,
      status: whData.status || 'Active',
      createdAt: new Date().toISOString()
    };
    setWarehouses(prev => [...prev, newWarehouse]);
    addToast(`Warehouse "${newWarehouse.name}" added successfully!`, 'success');
    return newWarehouse;
  };

  const updateWarehouse = (id, whData) => {
    setWarehouses(prev => prev.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        ...whData,
        storageCapacity: Number(whData.storageCapacity ?? w.storageCapacity)
      };
    }));
    addToast('Warehouse updated successfully!', 'success');
  };

  const deleteWarehouse = (id) => {
    const warehouse = warehouses.find(w => w.id === id);
    if (!warehouse) return;

    // Check if warehouse has any active inventory
    const totalInventoryInWarehouse = products.reduce((acc, p) => {
      return acc + (Number(p.warehouseStock?.[id]) || 0);
    }, 0);

    if (totalInventoryInWarehouse > 0) {
      addToast(
        `Cannot delete "${warehouse.name}". It currently stores ${totalInventoryInWarehouse} units of inventory. Transfer or remove stock first.`,
        'error',
        6000
      );
      return false;
    }

    setWarehouses(prev => prev.filter(w => w.id !== id));
    addToast(`Warehouse "${warehouse.name}" deleted.`, 'info');
    return true;
  };

  const transferStock = ({ sourceWarehouseId, destWarehouseId, productId, quantity, notes }) => {
    if (sourceWarehouseId === destWarehouseId) {
      addToast('Source and destination warehouses cannot be the same.', 'error');
      return false;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      addToast('Transfer quantity must be a positive number.', 'error');
      return false;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      addToast('Selected product does not exist.', 'error');
      return false;
    }

    const sourceStock = Number(product.warehouseStock?.[sourceWarehouseId]) || 0;
    if (sourceStock < qty) {
      addToast(`Insufficient stock in source warehouse. Available: ${sourceStock}, Requested: ${qty}.`, 'error');
      return false;
    }

    const sourceWh = warehouses.find(w => w.id === sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === destWarehouseId);

    // Update Product warehouse balances atomically
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const currentSource = Number(p.warehouseStock?.[sourceWarehouseId]) || 0;
      const currentDest = Number(p.warehouseStock?.[destWarehouseId]) || 0;
      
      const newWhStock = {
        ...(p.warehouseStock || {}),
        [sourceWarehouseId]: Math.max(0, currentSource - qty),
        [destWarehouseId]: currentDest + qty
      };
      return {
        ...p,
        warehouseStock: newWhStock
      };
    }));

    // Record Transfer
    const transferRecord = {
      id: `TRF-${900 + transfers.length + Math.floor(Math.random() * 50) + 1}`,
      sourceWarehouseId,
      sourceWarehouseName: sourceWh?.name || 'Source',
      destinationWarehouseId: destWarehouseId,
      destinationWarehouseName: destWh?.name || 'Destination',
      productId,
      productName: product.name,
      quantity: qty,
      status: 'Completed',
      notes: notes || 'Inter-warehouse stock transfer.',
      createdAt: new Date().toISOString()
    };

    setTransfers(prev => [transferRecord, ...prev]);

    // Record audit transactions
    const txnOut = {
      id: `TXN-${Date.now().toString().slice(-6)}A`,
      productId,
      productName: product.name,
      warehouseId: sourceWarehouseId,
      warehouseName: sourceWh?.name || 'Source',
      type: 'STOCK_OUT',
      quantity: qty,
      previousStock: sourceStock,
      updatedStock: sourceStock - qty,
      date: new Date().toISOString(),
      notes: `Transfer OUT to ${destWh?.name || 'dest'} (TRF: ${transferRecord.id})`
    };

    const destStock = Number(product.warehouseStock?.[destWarehouseId]) || 0;
    const txnIn = {
      id: `TXN-${Date.now().toString().slice(-6)}B`,
      productId,
      productName: product.name,
      warehouseId: destWarehouseId,
      warehouseName: destWh?.name || 'Destination',
      type: 'STOCK_IN',
      quantity: qty,
      previousStock: destStock,
      updatedStock: destStock + qty,
      date: new Date().toISOString(),
      notes: `Transfer IN from ${sourceWh?.name || 'source'} (TRF: ${transferRecord.id})`
    };

    setTransactions(prev => [txnIn, txnOut, ...prev]);
    addToast(`Successfully transferred ${qty} units of "${product.name}" from ${sourceWh?.name} to ${destWh?.name}.`, 'success');
    return true;
  };

  // ==========================================
  // SUPPLIER OPERATIONS
  // ==========================================
  const addSupplier = (supData) => {
    const newId = `SUP-${100 + suppliers.length + Math.floor(Math.random() * 50) + 1}`;
    const newSupplier = {
      id: newId,
      name: supData.name.trim(),
      companyName: supData.companyName.trim(),
      email: supData.email.trim(),
      phone: supData.phone.trim(),
      address: supData.address.trim(),
      suppliedProducts: Array.isArray(supData.suppliedProducts) ? supData.suppliedProducts : (supData.suppliedProducts ? supData.suppliedProducts.split(',').map(s => s.trim()) : []),
      status: supData.status || 'Active',
      createdAt: new Date().toISOString()
    };
    setSuppliers(prev => [...prev, newSupplier]);
    addToast(`Supplier "${newSupplier.companyName}" added successfully!`, 'success');
    return newSupplier;
  };

  const updateSupplier = (id, supData) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        ...supData,
        suppliedProducts: Array.isArray(supData.suppliedProducts) ? supData.suppliedProducts : (supData.suppliedProducts ? supData.suppliedProducts.split(',').map(item => item.trim()) : s.suppliedProducts)
      };
    }));
    addToast('Supplier details updated successfully!', 'success');
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;

    // Check if supplier has pending purchase orders
    const hasPendingOrders = purchaseOrders.some(
      po => po.supplierId === id && (po.status === 'Pending' || po.status === 'Approved' || po.status === 'Draft')
    );

    if (hasPendingOrders) {
      addToast(`Cannot delete "${supplier.companyName}" because there are active or pending purchase orders associated with this vendor.`, 'error', 6000);
      return false;
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
    addToast(`Supplier "${supplier.companyName}" deleted.`, 'info');
    return true;
  };

  // ==========================================
  // PURCHASE ORDER OPERATIONS
  // ==========================================
  const createPurchaseOrder = (poData) => {
    if (!poData.items || !poData.items.length) {
      addToast('Purchase order must contain at least one item.', 'error');
      return null;
    }

    const calculatedTotal = poData.items.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.unitPrice)), 0);
    const newId = `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    const newPO = {
      id: newId,
      supplierId: poData.supplierId,
      orderDate: new Date().toISOString(),
      expectedDelivery: poData.expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString(),
      targetWarehouseId: poData.targetWarehouseId || warehouses[0]?.id || 'WH-001',
      status: poData.status || 'Draft',
      notes: poData.notes || '',
      items: poData.items.map(it => ({
        ...it,
        total: Number(it.quantity) * Number(it.unitPrice)
      })),
      totalAmount: calculatedTotal
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    addToast(`Purchase Order #${newId} created successfully!`, 'success');
    return newPO;
  };

  const updatePurchaseOrderStatus = (id, newStatus) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id !== id) return po;
      return { ...po, status: newStatus };
    }));
    addToast(`Purchase Order #${id} status changed to ${newStatus}.`, 'info');
  };

  const cancelPurchaseOrder = (id) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return false;
    if (po.status === 'Received') {
      addToast('Cannot cancel an order that has already been received.', 'error');
      return false;
    }
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status: 'Cancelled' } : p));
    addToast(`Purchase order #${id} has been cancelled.`, 'info');
    return true;
  };

  const receivePurchaseOrder = (id) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) {
      addToast('Purchase order not found.', 'error');
      return false;
    }

    if (po.status === 'Received') {
      addToast('This order has already been received! Duplicate receiving is prohibited.', 'error');
      return false;
    }

    if (po.status === 'Cancelled') {
      addToast('Cannot receive a cancelled order.', 'error');
      return false;
    }

    const targetWarehouseId = po.targetWarehouseId || warehouses[0]?.id || 'WH-001';
    const targetWh = warehouses.find(w => w.id === targetWarehouseId);
    const newTxns = [];

    // Atomically increment stock for each line item
    setProducts(prev => {
      return prev.map(product => {
        const orderItem = po.items.find(it => it.productId === product.id);
        if (!orderItem) return product;

        const addQty = Number(orderItem.quantity) || 0;
        const currentWhStock = Number(product.warehouseStock?.[targetWarehouseId]) || 0;
        const newWhStock = currentWhStock + addQty;

        const updatedWhStock = {
          ...(product.warehouseStock || {}),
          [targetWarehouseId]: newWhStock
        };

        const totalStock = Object.values(updatedWhStock).reduce((a, b) => a + (Number(b) || 0), 0);

        newTxns.push({
          id: `TXN-${Date.now().toString().slice(-6)}-${product.id.slice(-3)}`,
          productId: product.id,
          productName: product.name,
          warehouseId: targetWarehouseId,
          warehouseName: targetWh?.name || 'Warehouse',
          type: 'STOCK_IN',
          quantity: addQty,
          previousStock: currentWhStock,
          updatedStock: newWhStock,
          date: new Date().toISOString(),
          notes: `Received from Purchase Order #${po.id}`
        });

        return {
          ...product,
          warehouseStock: updatedWhStock,
          stock: totalStock
        };
      });
    });

    // Record transactions
    if (newTxns.length) {
      setTransactions(prev => [...newTxns, ...prev]);
    }

    // Mark PO as received
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        status: 'Received',
        receivedAt: new Date().toISOString()
      };
    }));

    addToast(`Purchase Order #${po.id} marked as Received. Inventory updated across all line items!`, 'success', 5000);
    return true;
  };

  // ==========================================
  // SETTINGS & SYSTEM RESET
  // ==========================================
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('Store settings updated successfully!', 'success');
  };

  const resetToDemo = () => {
    storageService.resetToDemo();
    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransfers(INITIAL_TRANSFERS);
    setSettings(INITIAL_SETTINGS);
    addToast('Demo database successfully restored to pristine state!', 'success');
  };

  const importDatabase = (jsonData) => {
    try {
      storageService.importDatabaseJSON(jsonData);
      if (jsonData.products) setProducts(jsonData.products);
      if (jsonData.warehouses) setWarehouses(jsonData.warehouses);
      if (jsonData.suppliers) setSuppliers(jsonData.suppliers);
      if (jsonData.purchaseOrders) setPurchaseOrders(jsonData.purchaseOrders);
      if (jsonData.transactions) setTransactions(jsonData.transactions);
      if (jsonData.transfers) setTransfers(jsonData.transfers);
      if (jsonData.settings) setSettings(jsonData.settings);
      addToast('Backup imported successfully!', 'success');
      return true;
    } catch (err) {
      addToast(`Import failed: ${err.message}`, 'error');
      return false;
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      warehouses,
      suppliers,
      purchaseOrders,
      transactions,
      transfers,
      settings,
      stats,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addWarehouse,
      updateWarehouse,
      deleteWarehouse,
      transferStock,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      createPurchaseOrder,
      updatePurchaseOrderStatus,
      cancelPurchaseOrder,
      receivePurchaseOrder,
      updateSettings,
      resetToDemo,
      importDatabase
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
