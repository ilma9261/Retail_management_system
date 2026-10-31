/**
 * API Service — connects the frontend to the Node/Express backend.
 * All requests are authenticated via JWT stored in localStorage.
 * Base URL reads from Vite env var VITE_API_URL, falling back to localhost:5000.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Token helpers ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'retailflow_jwt_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch (_) { /* ignore */ }
    throw new Error(errMsg);
  }

  // 204 No Content
  if (response.status === 204) return null;
  return response.json();
}

const get = (path) => request(path, { method: 'GET' });
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (email, password, role = 'staff', firstName = '', lastName = '') =>
    post('/auth/register', { email, password, role, firstName, lastName }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => get('/dashboard'),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () => get('/products'),
  getById: (id) => get(`/products/${id}`),
  create: (data) => post('/products', data),
  update: (id, data) => put(`/products/${id}`, data),
  delete: (id) => del(`/products/${id}`),
};

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const warehousesApi = {
  getAll: () => get('/warehouses'),
  getById: (id) => get(`/warehouses/${id}`),
  create: (data) => post('/warehouses', data),
  update: (id, data) => put(`/warehouses/${id}`, data),
  delete: (id) => del(`/warehouses/${id}`),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliersApi = {
  getAll: () => get('/suppliers'),
  getById: (id) => get(`/suppliers/${id}`),
  create: (data) => post('/suppliers', data),
  update: (id, data) => put(`/suppliers/${id}`, data),
  delete: (id) => del(`/suppliers/${id}`),
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  getAll: () => get('/purchase-orders'),
  getById: (id) => get(`/purchase-orders/${id}`),
  create: (data) => post('/purchase-orders', data),
  updateStatus: (id, status) => patch(`/purchase-orders/${id}/status`, { status }),
  delete: (id) => del(`/purchase-orders/${id}`),
};

// ─── Stock Transfers ──────────────────────────────────────────────────────────
export const stockTransfersApi = {
  getAll: () => get('/stock-transfers'),
  create: (data) => post('/stock-transfers', data),
};

// ─── Inventory / Transactions ─────────────────────────────────────────────────
export const inventoryApi = {
  getAll: () => get('/inventory'),
  getTransactions: () => get('/inventory/transactions'),
  adjustStock: (data) => post('/inventory/adjust', data),
};
