import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building,
  Package,
  FileText
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
import { formatDate, formatNumber } from '../utils/formatters';
import { validateTransfer } from '../services/validationService';
import { exportToCSV } from '../services/exportService';

export const Transfers = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const {
    transfers,
    warehouses,
    products,
    transferStock
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Form State
  const initialForm = {
    sourceWarehouseId: warehouses[0]?.id || '',
    destWarehouseId: warehouses[1]?.id || '',
    productId: products[0]?.id || '',
    quantity: '10',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (location.state?.openTransferModal) {
      handleOpenCreate();
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setFormData({
      sourceWarehouseId: warehouses[0]?.id || '',
      destWarehouseId: warehouses[1]?.id || warehouses[0]?.id || '',
      productId: products[0]?.id || '',
      quantity: '10',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Compute available stock of selected product in selected source warehouse
  const selectedProduct = products.find(p => p.id === formData.productId);
  const availableSourceStock = Number(selectedProduct?.warehouseStock?.[formData.sourceWarehouseId]) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateTransfer(
      formData.sourceWarehouseId,
      formData.destWarehouseId,
      formData.productId,
      formData.quantity,
      availableSourceStock
    );

    if (!validation.isValid) {
      addToast(validation.message, 'error');
      return;
    }

    const success = transferStock({
      sourceWarehouseId: formData.sourceWarehouseId,
      destWarehouseId: formData.destWarehouseId,
      productId: formData.productId,
      quantity: Number(formData.quantity),
      notes: formData.notes
    });

    if (success) {
      setIsModalOpen(false);
    }
  };

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchSearch =
        search === '' ||
        t.productName.toLowerCase().includes(search.toLowerCase()) ||
        t.sourceWarehouseName.toLowerCase().includes(search.toLowerCase()) ||
        t.destinationWarehouseName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [transfers, search]);

  const totalPages = Math.ceil(filteredTransfers.length / pageSize) || 1;
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransfers.slice(start, start + pageSize);
  }, [filteredTransfers, currentPage]);

  const handleExportCSV = () => {
    const headers = [
      { key: 'id', label: 'Transfer ID' },
      { key: 'createdAt', label: 'Date' },
      { key: 'productName', label: 'Product Name' },
      { key: 'sourceWarehouseName', label: 'Source Warehouse' },
      { key: 'destinationWarehouseName', label: 'Destination Warehouse' },
      { key: 'quantity', label: 'Transferred Units' },
      { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Reason / Notes' }
    ];
    exportToCSV(filteredTransfers, headers, 'retailflow-stock-transfers');
  };

  const columns = [
    {
      header: 'Transfer ID & Date',
      render: (t) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs block">{t.id}</span>
          <span className="text-[11px] text-slate-400 block">{formatDate(t.createdAt)}</span>
        </div>
      )
    },
    {
      header: 'Product Item',
      render: (t) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{t.productName}</p>
          <p className="text-[11px] text-slate-400 font-mono">{t.productId}</p>
        </div>
      )
    },
    {
      header: 'Transfer Route (Origin → Destination)',
      render: (t) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {t.sourceWarehouseName.replace(' Warehouse', '')}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            {t.destinationWarehouseName.replace(' Warehouse', '')}
          </span>
        </div>
      )
    },
    {
      header: 'Quantity',
      render: (t) => (
        <span className="font-extrabold text-slate-900 text-xs">
          {formatNumber(t.quantity)} units
        </span>
      )
    },
    {
      header: 'Status',
      render: (t) => (
        <Badge variant={t.status === 'Completed' ? 'success' : 'primary'} size="sm">
          {t.status}
        </Badge>
      )
    },
    {
      header: 'Notes / Reason',
      render: (t) => (
        <p className="text-xs text-slate-500 max-w-xs truncate" title={t.notes}>
          {t.notes || '—'}
        </p>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Inter-Warehouse Stock Transfers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Shift inventory between distribution centers with automated balance deduction and destination receipt
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
            New Stock Transfer
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card bodyClassName="p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transfer ID, product, source or destination warehouse..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Total Transfers Recorded: <strong className="text-slate-800">{transfers.length}</strong>
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={paginatedTransfers}
          emptyMessage="No stock transfer records match your search criteria."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTransfers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Create Stock Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Inter-Warehouse Transfer"
        subtitle="Stock will be deducted from source and added to destination atomically"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Execute Transfer
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Product to Transfer"
            name="productId"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Source Warehouse (Origin)"
              name="sourceWarehouseId"
              value={formData.sourceWarehouseId}
              onChange={(e) => setFormData({ ...formData, sourceWarehouseId: e.target.value })}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />

            <Select
              label="Destination Warehouse"
              name="destWarehouseId"
              value={formData.destWarehouseId}
              onChange={(e) => setFormData({ ...formData, destWarehouseId: e.target.value })}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />
          </div>

          {/* Live Source Stock Indicator */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-blue-800 font-semibold block">Available at Source Facility</span>
              <span className="text-slate-500 text-[11px]">
                {warehouses.find(w => w.id === formData.sourceWarehouseId)?.name}
              </span>
            </div>
            <span className={`text-base font-extrabold ${availableSourceStock > 0 ? 'text-blue-900' : 'text-rose-600'}`}>
              {availableSourceStock} units
            </span>
          </div>

          <Input
            label="Transfer Quantity"
            name="quantity"
            type="number"
            min="1"
            max={availableSourceStock}
            placeholder="10"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            helperText={`Must be ≤ ${availableSourceStock} units`}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Transfer Purpose / Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Replenishing regional demand in Noida distribution hub"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
