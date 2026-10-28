import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  Edit2,
  Trash2,
  Eye,
  Package,
  Download,
  ShoppingCart
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
import { formatCurrency, formatNumber } from '../utils/formatters';
import { validateSupplier } from '../services/validationService';
import { exportToCSV } from '../services/exportService';

export const Suppliers = () => {
  const { addToast } = useToast();
  const {
    suppliers,
    products,
    purchaseOrders,
    settings,
    addSupplier,
    updateSupplier,
    deleteSupplier
  } = useInventory();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    suppliedProducts: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingId(sup.id);
    setFormData({
      name: sup.name,
      companyName: sup.companyName,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      suppliedProducts: Array.isArray(sup.suppliedProducts) ? sup.suppliedProducts.join(', ') : (sup.suppliedProducts || ''),
      status: sup.status || 'Active'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (sup) => {
    setSelectedSupplier(sup);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (sup) => {
    setSelectedSupplier(sup);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSupplier) {
      const deleted = deleteSupplier(selectedSupplier.id);
      if (deleted) {
        setIsDeleteModalOpen(false);
        setSelectedSupplier(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateSupplier(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      addToast('Please correct the supplier form errors.', 'error');
      return;
    }

    if (editingId) {
      updateSupplier(editingId, formData);
    } else {
      addSupplier(formData);
    }
    setIsFormModalOpen(false);
  };

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchSearch =
        search === '' ||
        sup.companyName.toLowerCase().includes(search.toLowerCase()) ||
        sup.name.toLowerCase().includes(search.toLowerCase()) ||
        sup.email.toLowerCase().includes(search.toLowerCase()) ||
        sup.id.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [suppliers, search]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage]);

  // Supplier purchase orders and product catalog
  const supplierPurchaseOrders = useMemo(() => {
    if (!selectedSupplier) return [];
    return purchaseOrders.filter(po => po.supplierId === selectedSupplier.id);
  }, [selectedSupplier, purchaseOrders]);

  const supplierLinkedProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return products.filter(p => p.supplierId === selectedSupplier.id);
  }, [selectedSupplier, products]);

  const handleExportCSV = () => {
    const headers = [
      { key: 'id', label: 'Supplier ID' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'name', label: 'Contact Person' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'status', label: 'Status' }
    ];
    exportToCSV(filteredSuppliers, headers, 'retailflow-suppliers-directory');
  };

  const columns = [
    {
      header: 'Supplier & Company',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
            {s.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer" onClick={() => handleOpenDetail(s)}>
              {s.companyName}
            </p>
            <p className="text-[11px] text-slate-400">Attn: {s.name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Details',
      render: (s) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-800 flex items-center gap-1.5 font-medium">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email}
          </p>
          <p className="text-slate-500 flex items-center gap-1.5 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
          </p>
        </div>
      )
    },
    {
      header: 'Location / City',
      render: (s) => (
        <p className="text-xs text-slate-600 max-w-xs truncate" title={s.address}>
          {s.address}
        </p>
      )
    },
    {
      header: 'Product Lines',
      render: (s) => {
        const list = Array.isArray(s.suppliedProducts) ? s.suppliedProducts : [];
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-800">{list.length} products</span>
            <p className="text-[10px] text-slate-400 truncate max-w-xs">{list.join(', ') || 'General'}</p>
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (s) => (
        <Badge variant={s.status === 'Active' ? 'success' : 'default'} size="sm">
          {s.status || 'Active'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenDetail(s)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Supplier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(s)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Supplier"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            Supplier & Vendor Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain authorized procurement vendors, corporate contact channels, and supplied product lines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card bodyClassName="p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendor name, company, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <span className="text-xs text-slate-500">
            Verified Suppliers: <strong className="text-slate-800">{suppliers.length}</strong>
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={paginatedSuppliers}
          emptyMessage="No suppliers matched your search."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingId ? 'Edit Supplier Record' : 'Register New Supplier'}
        subtitle="Maintain vendor contact credentials and supplied goods profile"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Register Supplier'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            name="companyName"
            placeholder="e.g. Acme Techtronics Pvt Ltd"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            error={formErrors.companyName}
            required
          />

          <Input
            label="Key Account Contact Person"
            name="name"
            placeholder="e.g. Ramesh Chandra"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              name="email"
              type="email"
              placeholder="orders@supplier.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              placeholder="+91 98111 22334"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
              required
            />
          </div>

          <Input
            label="Corporate / Warehouse Address"
            name="address"
            placeholder="Industrial Estate, Phase 4, City, State"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Supplied Products (comma separated)"
            name="suppliedProducts"
            placeholder="Wireless Mouse, USB-C Charger, Smart Watch"
            value={formData.suppliedProducts}
            onChange={(e) => setFormData({ ...formData, suppliedProducts: e.target.value })}
            helperText="Key product tags associated with this supplier"
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Active', label: 'Active Partner' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </form>
      </Modal>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedSupplier.companyName}
          subtitle={`Supplier ID: ${selectedSupplier.id} • Contact: ${selectedSupplier.name}`}
          maxWidth="max-w-xl"
          footer={
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="font-semibold text-slate-800">{selectedSupplier.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Telephone</span>
                <span className="font-semibold text-slate-800">{selectedSupplier.phone}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Corporate Address</span>
                <span className="font-medium text-slate-700">{selectedSupplier.address}</span>
              </div>
            </div>

            {/* Supplied Catalog */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Package className="w-3.5 h-3.5 text-blue-600" /> Catalog Products Supplied ({supplierLinkedProducts.length})
              </h4>
              <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                {supplierLinkedProducts.length === 0 ? (
                  <p className="p-4 text-center text-slate-400">No active products assigned to this supplier yet.</p>
                ) : (
                  supplierLinkedProducts.map(p => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.sku} • {p.category}</p>
                      </div>
                      <span className="font-bold text-slate-800">{formatCurrency(p.purchasePrice, settings.currency)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Purchase Orders Placed */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" /> Procurement Order History ({supplierPurchaseOrders.length})
              </h4>
              <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                {supplierPurchaseOrders.length === 0 ? (
                  <p className="p-4 text-center text-slate-400">No purchase orders placed with this supplier.</p>
                ) : (
                  supplierPurchaseOrders.map(po => (
                    <div key={po.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900 mr-2">{po.id}</span>
                        <Badge size="sm" variant={po.status === 'Received' ? 'success' : po.status === 'Pending' ? 'warning' : 'default'}>
                          {po.status}
                        </Badge>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(po.totalAmount, settings.currency)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Supplier Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier Vendor?"
        message={`Are you sure you want to delete "${selectedSupplier?.companyName}"? The system will ensure there are no active or pending purchase orders attached.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
};
