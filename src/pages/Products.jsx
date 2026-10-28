import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Download,
  Package,
  Layers,
  ArrowUpDown,
  Building,
  Truck
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
import { formatCurrency, formatNumber, formatDate, generateSKU } from '../utils/formatters';
import { validateProduct } from '../services/validationService';
import { exportToCSV } from '../services/exportService';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Grocery',
  'Home & Kitchen',
  'Personal Care',
  'Accessories'
];

export const Products = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const {
    products,
    warehouses,
    suppliers,
    settings,
    addProduct,
    updateProduct,
    deleteProduct
  } = useInventory();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    category: CATEGORIES[0],
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    initialStock: '10',
    minStockLevel: '15',
    supplierId: suppliers[0]?.id || '',
    warehouseId: warehouses[0]?.id || ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Check if routed with openAddModal from dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenCreate();
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      sku: generateSKU(CATEGORIES[0], 'NEW'),
      supplierId: suppliers[0]?.id || '',
      warehouseId: warehouses[0]?.id || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || '',
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      initialStock: product.stock,
      minStockLevel: product.minStockLevel,
      supplierId: product.supplierId || '',
      warehouseId: product.warehouseId || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleGenerateSKU = () => {
    const sku = generateSKU(formData.category, formData.name);
    setFormData(prev => ({ ...prev, sku }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const validation = validateProduct(formData, products, editingId);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      addToast('Please resolve validation errors in the form.', 'error');
      return;
    }

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }

    setIsFormModalOpen(false);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchSearch =
        search === '' ||
        prod.name.toLowerCase().includes(search.toLowerCase()) ||
        prod.sku.toLowerCase().includes(search.toLowerCase()) ||
        prod.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === '' || prod.category === selectedCategory;

      let status = 'In Stock';
      if (prod.stock <= 0) status = 'Out of Stock';
      else if (prod.stock <= prod.minStockLevel) status = 'Low Stock';

      const matchStatus =
        selectedStatus === '' || status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.sellingPrice - b.sellingPrice;
        case 'price_desc':
          return b.sellingPrice - a.sellingPrice;
        case 'stock_asc':
          return a.stock - b.stock;
        case 'stock_desc':
          return b.stock - a.stock;
        case 'createdAt_desc':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [products, search, selectedCategory, selectedStatus, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleExportCSV = () => {
    const headers = [
      { key: 'id', label: 'Product ID' },
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'purchasePrice', label: 'Purchase Price (INR)' },
      { key: 'sellingPrice', label: 'Selling Price (INR)' },
      { key: 'stock', label: 'Total Units' },
      { key: 'minStockLevel', label: 'Min Stock' },
      { key: 'createdAt', label: 'Created At' }
    ];
    exportToCSV(filteredProducts, headers, 'retailflow-products-catalog');
  };

  const columns = [
    {
      header: 'Product & SKU',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
            {p.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer" onClick={() => handleOpenDetail(p)}>
              {p.name}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (p) => (
        <Badge variant="default" size="sm">
          {p.category}
        </Badge>
      )
    },
    {
      header: 'Cost / Selling',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">
            {formatCurrency(p.sellingPrice, settings.currency)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Cost: {formatCurrency(p.purchasePrice, settings.currency)}
          </span>
        </div>
      )
    },
    {
      header: 'Stock Level',
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
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                {formatNumber(p.stock)}
              </span>
              <span className="text-xs text-slate-400">units</span>
            </div>
            <Badge variant={variant} size="sm" className="mt-0.5">
              {label}
            </Badge>
          </div>
        );
      }
    },
    {
      header: 'Warehouse Stock',
      render: (p) => (
        <div className="text-xs space-y-0.5 text-slate-600">
          {warehouses.map(w => (
            <div key={w.id} className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 w-16 truncate">{w.name.replace(' Warehouse', '')}:</span>
              <span className="font-semibold text-slate-700">{p.warehouseStock?.[w.id] || 0}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenDetail(p)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(p)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage SKU specifications, retail pricing, supplier allocations, and stock thresholds
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
            className="shadow-sm"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product, SKU, tag..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map(c => ({ value: c, label: c }))
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Stock Statuses' },
              { value: 'In Stock', label: 'In Stock' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out of Stock', label: 'Out of Stock' }
            ]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'createdAt_desc', label: 'Sort: Newest First' },
              { value: 'name_asc', label: 'Sort: Name (A - Z)' },
              { value: 'name_desc', label: 'Sort: Name (Z - A)' },
              { value: 'price_asc', label: 'Sort: Price (Low - High)' },
              { value: 'price_desc', label: 'Sort: Price (High - Low)' },
              { value: 'stock_asc', label: 'Sort: Stock (Low - High)' },
              { value: 'stock_desc', label: 'Sort: Stock (High - Low)' }
            ]}
          />
        </div>
      </Card>

      {/* Products Data Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={paginatedProducts}
          emptyMessage="No products match your active search or filter criteria."
          emptyAction={
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedStatus(''); }}>
              Clear Filters
            </Button>
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingId ? 'Edit Product Details' : 'Create New Product'}
        subtitle={editingId ? `Updating SKU record for #${formData.sku}` : 'Enter product information and initial warehouse stock'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitForm}>
              {editingId ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Stock Keeping Unit (SKU) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <Input
                name="sku"
                placeholder="ELEC-MOU-8491"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                error={formErrors.sku}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              error={formErrors.category}
              required
            />

            <Select
              label="Assigned Supplier"
              name="supplierId"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              options={suppliers.map(s => ({ value: s.id, label: `${s.companyName} (${s.name})` }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Purchase Cost Price (₹)"
              name="purchasePrice"
              type="number"
              min="0"
              step="any"
              placeholder="450.00"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              error={formErrors.purchasePrice}
              required
            />

            <Input
              label="Selling Retail Price (₹)"
              name="sellingPrice"
              type="number"
              min="0"
              step="any"
              placeholder="899.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              error={formErrors.sellingPrice}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editingId && (
              <Input
                label="Initial Stock Quantity"
                name="initialStock"
                type="number"
                min="0"
                placeholder="50"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                helperText="Will be deposited to the selected warehouse"
              />
            )}

            <Input
              label="Minimum Stock Alert Threshold"
              name="minStockLevel"
              type="number"
              min="1"
              placeholder="20"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              error={formErrors.minStockLevel}
              helperText="Alerts triggers when stock drops to or below this level"
              required
            />

            {!editingId && (
              <Select
                label="Primary Warehouse Depot"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                options={warehouses.map(w => ({ value: w.id, label: `${w.name} (${w.location.split(',')[0]})` }))}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Product Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter comprehensive item specifications, dimensions, warranty, or packaging details..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedProduct.name}
          subtitle={`SKU: ${selectedProduct.sku} • ID: ${selectedProduct.id}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(selectedProduct);
                }}
              >
                Edit Product
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Description */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed text-xs">
              {selectedProduct.description || 'No description provided for this product.'}
            </div>

            {/* Financial & Margin Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-blue-700 block">Purchase Cost</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {formatCurrency(selectedProduct.purchasePrice, settings.currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-emerald-700 block">Selling Price</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {formatCurrency(selectedProduct.sellingPrice, settings.currency)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] font-semibold uppercase text-purple-700 block">Gross Margin</span>
                <span className="text-sm font-bold text-purple-700 mt-0.5 block">
                  {selectedProduct.sellingPrice > 0
                    ? `${Math.round(((selectedProduct.sellingPrice - selectedProduct.purchasePrice) / selectedProduct.sellingPrice) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Warehouse Stock Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-500" /> Warehouse Inventory Breakdown
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {warehouses.map((wh) => {
                  const qty = selectedProduct.warehouseStock?.[wh.id] || 0;
                  return (
                    <div key={wh.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-900">{wh.name}</p>
                        <p className="text-[10px] text-slate-400">{wh.location.split(',')[0]}</p>
                      </div>
                      <span className="font-extrabold text-slate-800 text-sm">{qty} units</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supplier & Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Supplier:</span>
                <span className="font-semibold text-slate-800">
                  {suppliers.find(s => s.id === selectedProduct.supplierId)?.companyName || 'Not Assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Min Stock Alert Level:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.minStockLevel} units</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product SKU?"
        message={`Are you sure you want to delete "${selectedProduct?.name}" (${selectedProduct?.sku})? This product will be removed from catalog listings.`}
        confirmText="Delete Product"
      />
    </div>
  );
};
