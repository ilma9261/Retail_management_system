/**
 * LocalStorage Service with safe JSON parse, error boundaries,
 * and database reset/export/import capabilities.
 */
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  INITIAL_SETTINGS
} from './mockData';

export const STORAGE_KEYS = {
  PRODUCTS: 'retailflow_products',
  WAREHOUSES: 'retailflow_warehouses',
  SUPPLIERS: 'retailflow_suppliers',
  PURCHASE_ORDERS: 'retailflow_purchase_orders',
  TRANSACTIONS: 'retailflow_transactions',
  TRANSFERS: 'retailflow_transfers',
  SETTINGS: 'retailflow_settings',
  AUTH: 'retailflow_auth_session'
};

export const storageService = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      if (data === null || data === undefined) return fallback;
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading ${key} from localStorage:`, err);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error saving ${key} to localStorage:`, err);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing ${key} from localStorage:`, err);
      return false;
    }
  },

  // Initialize seed data if not present (First Launch check)
  initializeStorage(force = false) {
    const existing = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!existing || force) {
      console.log('Seeding initial RetailFlow dataset...');
      this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      this.set(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
      this.set(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
      this.set(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
      this.set(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
      this.set(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS);
      this.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      return true;
    }
    return false;
  },

  // Reset demo data to pristine state
  resetToDemo() {
    return this.initializeStorage(true);
  },

  // Export full application state as JSON
  exportDatabaseJSON() {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products: this.get(STORAGE_KEYS.PRODUCTS, []),
      warehouses: this.get(STORAGE_KEYS.WAREHOUSES, []),
      suppliers: this.get(STORAGE_KEYS.SUPPLIERS, []),
      purchaseOrders: this.get(STORAGE_KEYS.PURCHASE_ORDERS, []),
      transactions: this.get(STORAGE_KEYS.TRANSACTIONS, []),
      transfers: this.get(STORAGE_KEYS.TRANSFERS, []),
      settings: this.get(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `retailflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Import backup JSON
  importDatabaseJSON(parsedData) {
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid JSON backup file format');
    }
    if (parsedData.products) this.set(STORAGE_KEYS.PRODUCTS, parsedData.products);
    if (parsedData.warehouses) this.set(STORAGE_KEYS.WAREHOUSES, parsedData.warehouses);
    if (parsedData.suppliers) this.set(STORAGE_KEYS.SUPPLIERS, parsedData.suppliers);
    if (parsedData.purchaseOrders) this.set(STORAGE_KEYS.PURCHASE_ORDERS, parsedData.purchaseOrders);
    if (parsedData.transactions) this.set(STORAGE_KEYS.TRANSACTIONS, parsedData.transactions);
    if (parsedData.transfers) this.set(STORAGE_KEYS.TRANSFERS, parsedData.transfers);
    if (parsedData.settings) this.set(STORAGE_KEYS.SETTINGS, parsedData.settings);
    return true;
  }
};
