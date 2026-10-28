import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Table } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';

export const Inventory = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const {
    products,
    warehouses,
    transactions,
    stats,
    settings,
    adjustStock
  } = useInventory();

  // Tab View: 'stock' (Current Stock Overview) vs 'history' (Transaction Audit Trail)
  const [activeTab, setActiveTab] = useState('stock');

  // Modal States
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [modalType, setModalType] = useState('STOCK_IN'); // 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'

  // Form state
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    warehouseId: warehouses[0]?.id || '',
    quantity: '10',
    notes: ''
  });

  // Filters for Stock view
  const [search, setSearch] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const pageSize = 8;

  // Filters for History view
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  // Check state from Dashboard navigation
  useEffect(() => {
    if (location.state?.openStockInModal) {
      handleOpenModal('STOCK_IN', location.state.initialProductId);
    }
  }, [location.state]);

  const handleOpenModal = (type, prefillProductId = null) => {
    setModalType(type);
    setFormData({
      productId: prefillProductId || products[0]?.id || '',
      warehouseId: warehouses[0]?.id || '',
      quantity: '10',
      notes: ''
    });
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity);
    if (!formData.productId || !formData.warehouseId) {
      addToast('Please select both a product and warehouse.', 'error');
      return;
    }
    if (isNaN(qty) || qty === 0) {
      addToast('Please provide a valid quantity.', 'error');
      return;
    }

    const success = adjustStock({
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      quantity: qty,
      type: modalType,
      notes: formData.notes
    });

    if (success) {
      setIsStockModalOpen(false);
    }
  };

  // Selected product in modal for stock preview
  const activeModalProduct = products.find(p => p.id === formData.productId);
  const currentModalWhStock = activeModalProduct?.warehouseStock?.[formData.warehouseId] || 0;

  // Filtered Stock Items
  const filteredStockProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch =
        search === '' ||
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.sku.toLowerCase().includes(search.toLowerCase());

      let status = 'In Stock';
      if (prod.stock <= 0) status = 'Out of Stock';
      else if (prod.stock <= prod.minStockLevel) status = 'Low Stock';

      const matchStatus =
        selectedStatusFilter === '' || status === selectedStatusFilter;

      const matchWarehouse =
        selectedWarehouseFilter === '' ||
        (prod.warehouseStock?.[selectedWarehouseFilter] || 0) > 0;

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [products, search, selectedStatusFilter, selectedWarehouseFilter]);

  const totalStockPages = Math.ceil(filteredStockProducts.length / pageSize) || 1;
  const paginatedStockProducts = useMemo(() => {
    const start = (stockPage - 1) * pageSize;
    return filteredStockProducts.slice(start, start + pageSize);
  }, [filteredStockProducts, stockPage]);

  // Filtered Transaction History
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        historySearch === '' ||
        t.productName.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.notes?.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.id.toLowerCase().includes(historySearch.toLowerCase());

      const matchType =
        historyTypeFilter === '' || t.type === historyTypeFilter;

      return matchSearch && matchType;
    });
  }, [transactions, historySearch, historyTypeFilter]);

  const totalHistoryPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (historyPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, historyPage]);

  const handleExportStockCSV = () => {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'stock', label: 'Total Units' },
      { key: 'minStockLevel', label: 'Min Level' },
      ...warehouses.map(w => ({ key: `wh_${w.id}`, label: `${w.name} Stock` }))
    ];

    const data = filteredStockProducts.map(p => {
      const row = { ...p };
      warehouses.forEach(w => {
        row[`wh_${w.id}`] = p.warehouseStock?.[w.id] || 0;
      });
      return row;
    });

    exportToCSV(data, headers, 'retailflow-stock-levels');
  };

  const handleExportHistoryCSV = () => {
    const headers = [
      { key: 'id', label: 'Transaction ID' },
      { key: 'date', label: 'Date' },
      { key: 'productName', label: 'Product' },
      { key: 'warehouseName', label: 'Warehouse' },
      { key: 'type', label: 'Type' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'previousStock', label: 'Previous Stock' },
      { key: 'updatedStock', label: 'Updated Stock' },
      { key: 'notes', label: 'Notes' }
    ];
    exportToCSV(filteredTransactions, headers, 'retailflow-inventory-transactions');
  };

  const stockColumns = [
    {
      header: 'Product Item & SKU',
      render: (p) => (
        <div>
          <p className="font-bold text-slate-900">{p.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{p.sku} • {p.category}</p>
        </div>
      )
    },
    {
      header: 'Warehouse Distribution',
      render: (p) => (
        <div className="flex flex-wrap gap-2 text-xs">
          {warehouses.map(w => (
            <span key={w.id} className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700">
              <span className="text-slate-400 mr-1">{w.name.replace(' Warehouse', '')}:</span>
              <span className="font-bold">{p.warehouseStock?.[w.id] || 0}</span>
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Total Units',
      render: (p) => (
        <div>
          <span className="font-extrabold text-slate-900 text-sm">{formatNumber(p.stock)}</span>
          <span className="text-xs text-slate-400 ml-1">units</span>
        </div>
      )
    },
    {
      header: 'Stock Status',
      render: (p) => {
        let variant = 'success';
        let label = 'In Stock';
        if (p.stock <= 0) {
          variant = 'danger';
          label = 'Out of Stock';
        } else if (p.stock <= p.minStockLevel) {
          variant = 'warning';
          label = 'Low Stock';
        }
        return <Badge variant={variant} size="sm">{label}</Badge>;
      }
    },
    {
      header: 'Quick Adjust',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('STOCK_IN', p.id)}
            className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
          >
            + In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal('STOCK_OUT', p.id)}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            - Out
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal('ADJUSTMENT', p.id)}
            className="text-xs text-slate-600"
          >
            Audit
          </Button>
        </div>
      )
    }
  ];

  const historyColumns = [
    {
      header: 'Transaction ID & Date',
      render: (t) => (
        <div>
          <span className="font-bold font-mono text-slate-900 text-xs block">{t.id}</span>
          <span className="text-[11px] text-slate-400 block">{formatDate(t.date)}</span>
        </div>
      )
    },
    {
      header: 'Type',
      render: (t) => {
        let variant = 'purple';
        if (t.type === 'STOCK_IN') variant = 'success';
        if (t.type === 'STOCK_OUT') variant = 'danger';
        return <Badge variant={variant} size="sm">{t.type.replace('_', ' ')}</Badge>;
      }
    },
    {
      header: 'Product & Warehouse',
      render: (t) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{t.productName}</p>
          <p className="text-[11px] text-slate-400">{t.warehouseName}</p>
        </div>
      )
    },
    {
      header: 'Quantity Change',
      render: (t) => (
        <span className={`font-extrabold text-xs ${t.type === 'STOCK_IN' ? 'text-emerald-600' : t.type === 'STOCK_OUT' ? 'text-rose-600' : 'text-purple-600'}`}>
          {t.type === 'STOCK_IN' ? `+${t.quantity}` : t.type === 'STOCK_OUT' ? `-${t.quantity}` : (t.quantity > 0 ? `+${t.quantity}` : t.quantity)} units
        </span>
      )
    },
    {
      header: 'Stock Shift',
      render: (t) => (
        <span className="text-xs text-slate-500 font-mono">
          {t.previousStock} → <span className="font-bold text-slate-900">{t.updatedStock}</span>
        </span>
      )
    },
    {
      header: 'Audit Notes',
      render: (t) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={t.notes}>
          {t.notes || '—'}
        </p>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header & Top Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory Control & Auditing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time warehouse stock balances, process in/out stock adjustments, and review audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={ArrowUpRight}
            onClick={() => handleOpenModal('STOCK_IN')}
            className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
          >
            Stock In
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={ArrowDownRight}
            onClick={() => handleOpenModal('STOCK_OUT')}
            className="text-rose-700 hover:bg-rose-50 border-rose-300"
          >
            Stock Out
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => handleOpenModal('ADJUSTMENT')}
          >
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Live Stock Overview ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Transaction Audit Trail ({transactions.length})
          </button>
        </div>

        <div>
          {activeTab === 'stock' ? (
            <Button variant="ghost" size="sm" icon={Download} onClick={handleExportStockCSV}>
              Export Stock
            </Button>
          ) : (
            <Button variant="ghost" size="sm" icon={Download} onClick={handleExportHistoryCSV}>
              Export Audit Trail
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: LIVE STOCK OVERVIEW */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card bodyClassName="p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search item name, SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setStockPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Select
                value={selectedWarehouseFilter}
                onChange={(e) => {
                  setSelectedWarehouseFilter(e.target.value);
                  setStockPage(1);
                }}
                options={[
                  { value: '', label: 'All Warehouses' },
                  ...warehouses.map(w => ({ value: w.id, label: w.name }))
                ]}
              />

              <Select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setStockPage(1);
                }}
                options={[
                  { value: '', label: 'All Stock Statuses' },
                  { value: 'In Stock', label: 'In Stock' },
                  { value: 'Low Stock', label: 'Low Stock' },
                  { value: 'Out of Stock', label: 'Out of Stock' }
                ]}
              />
            </div>
          </Card>

          {/* Table */}
          <Card bodyClassName="p-0 overflow-hidden">
            <Table
              columns={stockColumns}
              data={paginatedStockProducts}
              emptyMessage="No stock items matched your search filters."
            />
            <Pagination
              currentPage={stockPage}
              totalPages={totalStockPages}
              totalItems={filteredStockProducts.length}
              pageSize={pageSize}
              onPageChange={setStockPage}
            />
          </Card>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card bodyClassName="p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search transaction ID, product, or audit notes..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Select
                value={historyTypeFilter}
                onChange={(e) => {
                  setHistoryTypeFilter(e.target.value);
                  setHistoryPage(1);
                }}
                options={[
                  { value: '', label: 'All Transaction Types' },
                  { value: 'STOCK_IN', label: 'Stock In' },
                  { value: 'STOCK_OUT', label: 'Stock Out' },
                  { value: 'ADJUSTMENT', label: 'Adjustment' }
                ]}
              />
            </div>
          </Card>

          {/* Table */}
          <Card bodyClassName="p-0 overflow-hidden">
            <Table
              columns={historyColumns}
              data={paginatedTransactions}
              emptyMessage="No inventory transaction records found."
            />
            <Pagination
              currentPage={historyPage}
              totalPages={totalHistoryPages}
              totalItems={filteredTransactions.length}
              pageSize={pageSize}
              onPageChange={setHistoryPage}
            />
          </Card>
        </div>
      )}

      {/* Stock Adjustment / In / Out Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={
          modalType === 'STOCK_IN'
            ? 'Process Stock In (Inbound Receipt)'
            : modalType === 'STOCK_OUT'
            ? 'Process Stock Out (Dispatch / Sales)'
            : 'Inventory Audit Adjustment'
        }
        subtitle="Modifications will immediately update warehouse inventory and generate an audit transaction"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsStockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={modalType === 'STOCK_OUT' ? 'danger' : 'primary'}
              onClick={handleStockSubmit}
            >
              Confirm Transaction
            </Button>
          </>
        }
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <Select
            label="Select Product"
            name="productId"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
            required
          />

          <Select
            label="Target Warehouse"
            name="warehouseId"
            value={formData.warehouseId}
            onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
            options={warehouses.map(w => ({ value: w.id, label: `${w.name} (${w.location.split(',')[0]})` }))}
            required
          />

          {/* Current Stock Preview Banner */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-blue-700 font-semibold block">Warehouse Available Stock</span>
              <span className="text-slate-500 font-mono text-[11px]">{activeModalProduct?.name || 'Item'}</span>
            </div>
            <span className="text-base font-extrabold text-blue-900">{currentModalWhStock} units</span>
          </div>

          <Input
            label={modalType === 'ADJUSTMENT' ? 'Adjustment Quantity (Positive to add, Negative to deduct)' : 'Quantity'}
            name="quantity"
            type="number"
            step="1"
            min={modalType === 'ADJUSTMENT' ? `-${currentModalWhStock}` : '1'}
            placeholder="10"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            helperText={
              modalType === 'STOCK_OUT'
                ? `Maximum permitted: ${currentModalWhStock} units (Negative stock prohibited)`
                : ''
            }
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Audit Reference / Reason</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={
                modalType === 'STOCK_IN'
                  ? 'e.g. Inbound purchase delivery or bonus batch'
                  : modalType === 'STOCK_OUT'
                  ? 'e.g. Showroom dispatch or customer sales order'
                  : 'e.g. Audit tally reconciliation, packaging damage'
              }
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
