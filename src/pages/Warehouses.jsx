import React, { useState, useMemo } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  User,
  Phone,
  Boxes,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { validateWarehouse } from '../services/validationService';

export const Warehouses = () => {
  const { addToast } = useToast();
  const {
    warehouses,
    products,
    stats,
    settings,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse
  } = useInventory();

  const [search, setSearch] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    name: '',
    location: '',
    managerName: '',
    contactNumber: '',
    storageCapacity: '35000',
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

  const handleOpenEdit = (wh) => {
    setEditingId(wh.id);
    setFormData({
      name: wh.name,
      location: wh.location,
      managerName: wh.managerName,
      contactNumber: wh.contactNumber,
      storageCapacity: wh.storageCapacity,
      status: wh.status || 'Active'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (wh) => {
    setSelectedWarehouse(wh);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (wh) => {
    setSelectedWarehouse(wh);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedWarehouse) {
      const deleted = deleteWarehouse(selectedWarehouse.id);
      if (deleted) {
        setIsDeleteModalOpen(false);
        setSelectedWarehouse(null);
      }
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const validation = validateWarehouse(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      addToast('Please correct form errors.', 'error');
      return;
    }

    if (editingId) {
      updateWarehouse(editingId, formData);
    } else {
      addWarehouse(formData);
    }

    setIsFormModalOpen(false);
  };

  // Warehouse items list for details modal
  const warehouseProducts = useMemo(() => {
    if (!selectedWarehouse) return [];
    return products
      .map(p => ({
        ...p,
        unitsInWh: Number(p.warehouseStock?.[selectedWarehouse.id]) || 0
      }))
      .filter(p => p.unitsInWh > 0);
  }, [selectedWarehouse, products]);

  // Enriched warehouses with real metrics
  const enrichedWarehouses = useMemo(() => {
    return warehouses.map(wh => {
      let storedUnits = 0;
      let storedValue = 0;
      products.forEach(p => {
        const qty = Number(p.warehouseStock?.[wh.id]) || 0;
        storedUnits += qty;
        storedValue += qty * (Number(p.purchasePrice) || 0);
      });
      const occupancy = wh.storageCapacity ? Math.min(100, Math.round((storedUnits / wh.storageCapacity) * 100)) : 0;
      return {
        ...wh,
        storedUnits,
        storedValue,
        occupancy
      };
    }).filter(wh => {
      return (
        search === '' ||
        wh.name.toLowerCase().includes(search.toLowerCase()) ||
        wh.location.toLowerCase().includes(search.toLowerCase()) ||
        wh.managerName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [warehouses, products, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Warehouse Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geographic hub control, capacity limits, facility managers, and live stock load
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
          Add Warehouse
        </Button>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search warehouse by name, city, manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-4">
          <span>Active Hubs: <strong className="text-slate-800">{warehouses.length}</strong></span>
          <span>Stored Units: <strong className="text-slate-800">{formatNumber(stats.totalStockUnits)}</strong></span>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedWarehouses.map((wh) => (
          <Card
            key={wh.id}
            title={wh.name}
            subtitle={wh.id}
            headerIcon={Building2}
            action={
              <Badge variant={wh.status === 'Active' ? 'success' : 'default'} size="sm">
                {wh.status || 'Active'}
              </Badge>
            }
            className="flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Location */}
              <div className="flex items-start gap-2.5 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{wh.location}</span>
              </div>

              {/* Manager & Contact */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Facility Manager</span>
                  <span className="font-semibold text-slate-800 truncate block">{wh.managerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Phone</span>
                  <span className="font-semibold text-slate-800 truncate block">{wh.contactNumber}</span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Capacity Utilization</span>
                  <span className="font-bold text-slate-900">{wh.occupancy}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wh.occupancy > 85 ? 'bg-rose-500' : wh.occupancy > 60 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, wh.occupancy))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{formatNumber(wh.storedUnits)} units stored</span>
                  <span>Max: {formatNumber(wh.storageCapacity)}</span>
                </div>
              </div>

              {/* Valuation */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Asset Valuation:</span>
                <span className="font-bold text-slate-900">{formatCurrency(wh.storedValue, settings.currency)}</span>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => handleOpenDetail(wh)}
                className="w-full text-xs"
              >
                Inspect Stock
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => handleOpenEdit(wh)}
                title="Edit Warehouse"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => handleOpenDelete(wh)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                title="Delete Warehouse"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Warehouse Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingId ? 'Edit Warehouse Depot' : 'Add New Warehouse'}
        subtitle="Specify storage capacity, physical address, and facility leadership"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitForm}>
              {editingId ? 'Save Changes' : 'Create Warehouse'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Warehouse Name"
            name="name"
            placeholder="e.g. Bangalore Logistics Depot"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Street Address / Location"
            name="location"
            placeholder="Plot 12, Phase II Industrial Area, City, State"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={formErrors.location}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Manager In-Charge"
              name="managerName"
              placeholder="e.g. Ramesh Kumar"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              error={formErrors.managerName}
              required
            />

            <Input
              label="Contact Phone"
              name="contactNumber"
              placeholder="+91 98765 43210"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              error={formErrors.contactNumber}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Storage Capacity (Units)"
              name="storageCapacity"
              type="number"
              min="1000"
              placeholder="40000"
              value={formData.storageCapacity}
              onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
              error={formErrors.storageCapacity}
              required
            />

            <Select
              label="Operational Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active Operational' },
                { value: 'Under Maintenance', label: 'Under Maintenance' },
                { value: 'Inactive', label: 'Inactive / Closed' }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Warehouse Detail & Stored Products Modal */}
      {selectedWarehouse && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`${selectedWarehouse.name} Inventory`}
          subtitle={`Facility ID: ${selectedWarehouse.id} • ${selectedWarehouse.location}`}
          maxWidth="max-w-2xl"
          footer={
            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span>Items Stored: <strong className="text-slate-900">{warehouseProducts.length} unique SKUs</strong></span>
              <span>Total Units: <strong className="text-slate-900">{formatNumber(warehouseProducts.reduce((a, b) => a + b.unitsInWh, 0))}</strong></span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {warehouseProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No inventory is currently stored in this warehouse.
                </div>
              ) : (
                warehouseProducts.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-700 block">{p.unitsInWh} units</span>
                      <span className="text-[10px] text-slate-400 block">Valued at {formatCurrency(p.unitsInWh * p.purchasePrice, settings.currency)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Warehouse Protection Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Warehouse Facility?"
        message={`Are you sure you want to delete "${selectedWarehouse?.name}"? The system will safely verify that no active inventory units are stored in this facility.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
};
