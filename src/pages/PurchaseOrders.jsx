import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Calendar,
  Building,
  Truck,
  IndianRupee,
  FileCheck2,
  ArrowRight
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
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';

export const PurchaseOrders = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const {
    purchaseOrders,
    suppliers,
    warehouses,
    products,
    settings,
    createPurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder,
    updatePurchaseOrderStatus
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [selectedPO, setSelectedPO] = useState(null);

  // Form State for creating a new Purchase Order
  const initialForm = {
    supplierId: suppliers[0]?.id || '',
    targetWarehouseId: warehouses[0]?.id || '',
    expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    status: 'Pending',
    notes: '',
    items: [
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || '',
        quantity: 50,
        unitPrice: products[0]?.purchasePrice || 100
      }
    ]
  };
  const [formData, setFormData] = useState(initialForm);

  // Auto open create modal if routed with flag
  useEffect(() => {
    if (location.state?.openCreateModal) {
      handleOpenCreate(location.state?.initialProductId);
    }
  }, [location.state]);

  const handleOpenCreate = (prefillProductId = null) => {
    let initialItems = initialForm.items;
    if (prefillProductId) {
      const p = products.find(prod => prod.id === prefillProductId);
      if (p) {
        initialItems = [
          {
            productId: p.id,
            productName: p.name,
            quantity: Math.max(30, (p.minStockLevel || 10) * 2),
            unitPrice: p.purchasePrice
          }
        ];
      }
    }
    setFormData({
      ...initialForm,
      supplierId: suppliers[0]?.id || '',
      targetWarehouseId: warehouses[0]?.id || '',
      items: initialItems
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenDetail = (po) => {
    setSelectedPO(po);
    setIsDetailModalOpen(true);
  };

  const handleOpenReceive = (po) => {
    setSelectedPO(po);
    setIsReceiveModalOpen(true);
  };

  const handleOpenCancel = (po) => {
    setSelectedPO(po);
    setIsCancelModalOpen(true);
  };

  // Line item manipulation
  const handleAddItemRow = () => {
    const firstProduct = products[0];
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: firstProduct?.id || '',
          productName: firstProduct?.name || '',
          quantity: 20,
          unitPrice: firstProduct?.purchasePrice || 100
        }
      ]
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) {
      addToast('A purchase order must contain at least one line item.', 'warning');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.items];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          productName: prod?.name || '',
          unitPrice: prod?.purchasePrice || updated[index].unitPrice
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
        };
      }
      return { ...prev, items: updated };
    });
  };

  // Calculated PO Total
  const calculatedTotal = useMemo(() => {
    return formData.items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  }, [formData.items]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.targetWarehouseId) {
      addToast('Please select a supplier and receiving warehouse.', 'error');
      return;
    }

    if (!formData.items.length) {
      addToast('Please add at least one product item.', 'error');
      return;
    }

    createPurchaseOrder(formData);
    setIsCreateModalOpen(false);
  };

  const handleConfirmReceive = () => {
    if (selectedPO) {
      const success = receivePurchaseOrder(selectedPO.id);
      if (success) {
        setIsReceiveModalOpen(false);
        setSelectedPO(null);
      }
    }
  };

  const handleConfirmCancel = () => {
    if (selectedPO) {
      const success = cancelPurchaseOrder(selectedPO.id);
      if (success) {
        setIsCancelModalOpen(false);
        setSelectedPO(null);
      }
    }
  };

  // Filter Purchase Orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const sup = suppliers.find(s => s.id === po.supplierId);
      const matchSearch =
        search === '' ||
        po.id.toLowerCase().includes(search.toLowerCase()) ||
        sup?.companyName.toLowerCase().includes(search.toLowerCase()) ||
        po.notes?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        selectedStatusFilter === '' || po.status === selectedStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, suppliers, search, selectedStatusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const handleExportCSV = () => {
    const headers = [
      { key: 'id', label: 'Purchase Order ID' },
      { key: 'orderDate', label: 'Order Date' },
      { key: 'expectedDelivery', label: 'Expected Delivery' },
      { key: 'status', label: 'Status' },
      { key: 'totalAmount', label: 'Total Amount (INR)' },
      { key: 'notes', label: 'Notes' }
    ];
    exportToCSV(filteredOrders, headers, 'retailflow-purchase-orders');
  };

  const columns = [
    {
      header: 'Order ID & Date',
      render: (po) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs block">{po.id}</span>
          <span className="text-[11px] text-slate-400 block">{formatDate(po.orderDate, false)}</span>
        </div>
      )
    },
    {
      header: 'Supplier Vendor',
      render: (po) => {
        const sup = suppliers.find(s => s.id === po.supplierId);
        return (
          <div>
            <p className="font-semibold text-slate-900 text-xs">{sup?.companyName || 'Supplier'}</p>
            <p className="text-[11px] text-slate-400">Attn: {sup?.name || 'Contact'}</p>
          </div>
        );
      }
    },
    {
      header: 'Receiving Depot',
      render: (po) => {
        const wh = warehouses.find(w => w.id === po.targetWarehouseId);
        return (
          <span className="text-xs text-slate-700 font-medium">
            {wh?.name.replace(' Warehouse', '') || 'Warehouse'}
          </span>
        );
      }
    },
    {
      header: 'Items Count',
      render: (po) => (
        <span className="text-xs font-semibold text-slate-700">
          {po.items?.length || 0} product lines
        </span>
      )
    },
    {
      header: 'Total Value',
      render: (po) => (
        <span className="font-extrabold text-slate-900 text-xs">
          {formatCurrency(po.totalAmount, settings.currency)}
        </span>
      )
    },
    {
      header: 'Status',
      render: (po) => {
        let variant = 'default';
        if (po.status === 'Received') variant = 'success';
        else if (po.status === 'Approved') variant = 'primary';
        else if (po.status === 'Pending') variant = 'warning';
        else if (po.status === 'Cancelled') variant = 'danger';
        return <Badge variant={variant} size="sm">{po.status}</Badge>;
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (po) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(po)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Inspect Order"
          >
            <Eye className="w-4 h-4" />
          </button>

          {po.status !== 'Received' && po.status !== 'Cancelled' && (
            <Button
              variant="outline"
              size="sm"
              icon={FileCheck2}
              onClick={() => handleOpenReceive(po)}
              className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
            >
              Receive
            </Button>
          )}

          {po.status !== 'Received' && po.status !== 'Cancelled' && (
            <button
              onClick={() => handleOpenCancel(po)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Cancel Order"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Purchase Orders & Inbound Receiving
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Procure inventory from authorized vendors, automate cost subtotaling, and sync received stock into warehouses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={() => handleOpenCreate()}>
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card bodyClassName="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PO number, vendor name, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Order Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Received', label: 'Received' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={paginatedOrders}
          emptyMessage="No purchase orders matched your active criteria."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Draft New Purchase Order"
        subtitle="Add line items, review cost subtotals, and assign destination facility"
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Total Estimated Amount</span>
              <span className="text-lg font-extrabold text-blue-900">{formatCurrency(calculatedTotal, settings.currency)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateSubmit}>
                Issue Purchase Order
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              options={suppliers.map(s => ({ value: s.id, label: `${s.companyName}` }))}
              required
            />

            <Select
              label="Destination Warehouse"
              name="targetWarehouseId"
              value={formData.targetWarehouseId}
              onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />

            <Input
              label="Expected Delivery Date"
              name="expectedDelivery"
              type="date"
              value={formData.expectedDelivery}
              onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
              required
            />
          </div>

          {/* Line Items Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Order Line Items ({formData.items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Product
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase grid grid-cols-12 gap-2">
                <span className="col-span-5">Product Item</span>
                <span className="col-span-2 text-right">Quantity</span>
                <span className="col-span-2 text-right">Unit Price</span>
                <span className="col-span-2 text-right">Subtotal</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {formData.items.map((item, idx) => (
                <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full text-right text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full text-right text-xs rounded-lg border border-slate-300 py-1.5 px-2 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2 text-right font-bold text-slate-900 pr-1">
                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), settings.currency)}
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700">Special Order Instructions / PO Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Include GST tax invoice in delivery packet, pallet shipment"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* PO Detail Modal */}
      {selectedPO && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Purchase Order #${selectedPO.id}`}
          subtitle={`Issued on ${formatDate(selectedPO.orderDate, false)} • Status: ${selectedPO.status}`}
          maxWidth="max-w-2xl"
          footer={
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Meta Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendor Supplier</span>
                <span className="font-semibold text-slate-800">
                  {suppliers.find(s => s.id === selectedPO.supplierId)?.companyName || selectedPO.supplierId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Facility</span>
                <span className="font-semibold text-slate-800">
                  {warehouses.find(w => w.id === selectedPO.targetWarehouseId)?.name || selectedPO.targetWarehouseId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Delivery</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedPO.expectedDelivery, false)}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/70 px-4 py-2 text-[11px] font-bold text-slate-600 uppercase grid grid-cols-12">
                <span className="col-span-6">Item Description</span>
                <span className="col-span-2 text-right">Units</span>
                <span className="col-span-2 text-right">Unit Rate</span>
                <span className="col-span-2 text-right">Total Amount</span>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedPO.items?.map((item, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-12 items-center">
                    <div className="col-span-6">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.productId}</p>
                    </div>
                    <span className="col-span-2 text-right font-medium text-slate-700">{item.quantity}</span>
                    <span className="col-span-2 text-right text-slate-500">{formatCurrency(item.unitPrice, settings.currency)}</span>
                    <span className="col-span-2 text-right font-extrabold text-slate-900">
                      {formatCurrency(item.total || item.quantity * item.unitPrice, settings.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center font-bold">
                <span className="text-slate-700">Total Purchase Commitment</span>
                <span className="text-sm font-extrabold text-blue-900">{formatCurrency(selectedPO.totalAmount, settings.currency)}</span>
              </div>
            </div>

            {selectedPO.notes && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-600">
                <strong className="text-blue-950 block text-[11px] mb-0.5">PO Notes:</strong>
                {selectedPO.notes}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Receive Purchase Order Dialog */}
      <ConfirmDialog
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onConfirm={handleConfirmReceive}
        title="Receive Purchase Order & Deposit Stock?"
        message={`Marking order #${selectedPO?.id} as RECEIVED will automatically increment inventory stock for all ${selectedPO?.items?.length || 0} line items in the designated warehouse. This can only be performed once.`}
        confirmText="Confirm & Receive Stock"
        confirmVariant="success"
      />

      {/* Confirm Cancel PO Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Purchase Order?"
        message={`Are you sure you want to cancel PO #${selectedPO?.id}? No inventory changes will take place.`}
        confirmText="Cancel Order"
      />
    </div>
  );
};
