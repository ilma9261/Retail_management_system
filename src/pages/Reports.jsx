import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  IndianRupee,
  Package,
  AlertTriangle,
  XCircle,
  Warehouse,
  TrendingUp,
  ShoppingCart,
  Truck,
  Download,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Table } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';

const REPORT_TABS = [
  { id: 'valuation', label: 'Inventory Valuation', icon: IndianRupee },
  { id: 'stock', label: 'Product Stock Status', icon: Package },
  { id: 'low_stock', label: 'Low Stock Alerts', icon: AlertTriangle },
  { id: 'out_of_stock', label: 'Out of Stock Items', icon: XCircle },
  { id: 'warehouse', label: 'Warehouse Capacity', icon: Warehouse },
  { id: 'movement', label: 'Stock Movement', icon: TrendingUp },
  { id: 'purchase_orders', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'suppliers', label: 'Supplier Performance', icon: Truck },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const Reports = () => {
  const {
    products,
    warehouses,
    suppliers,
    purchaseOrders,
    transactions,
    stats,
    settings
  } = useInventory();

  const [activeReport, setActiveReport] = useState('valuation');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // 1. Inventory Valuation Data
  const valuationData = useMemo(() => {
    return stats.categoryBreakdown.map(item => ({
      name: item.category,
      valuation: item.value,
      units: item.units,
      productCount: item.count
    }));
  }, [stats.categoryBreakdown]);

  // 2. Product Stock Data
  const productStockData = useMemo(() => {
    return products.filter(p => {
      const matchCat = !categoryFilter || p.category === categoryFilter;
      const matchWh = !warehouseFilter || (p.warehouseStock?.[warehouseFilter] || 0) > 0;
      return matchCat && matchWh;
    });
  }, [products, categoryFilter, warehouseFilter]);

  // 3. Low Stock Data
  const lowStockData = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel);
  }, [products]);

  // 4. Out of Stock Data
  const outOfStockData = useMemo(() => {
    return products.filter(p => p.stock <= 0);
  }, [products]);

  // 5. Warehouse Capacity Data
  const warehouseReportData = useMemo(() => {
    return stats.warehouseBreakdown;
  }, [stats.warehouseBreakdown]);

  // 6. Stock Movement Data
  const movementReportData = useMemo(() => {
    return transactions;
  }, [transactions]);

  // 7. Purchase Orders Data
  const poReportData = useMemo(() => {
    return purchaseOrders;
  }, [purchaseOrders]);

  // 8. Supplier Report Data
  const supplierReportData = useMemo(() => {
    return suppliers.map(s => {
      const orders = purchaseOrders.filter(po => po.supplierId === s.id);
      const totalSpend = orders.reduce((acc, po) => acc + (Number(po.totalAmount) || 0), 0);
      const suppliedCatalog = products.filter(p => p.supplierId === s.id);
      return {
        ...s,
        totalOrders: orders.length,
        totalSpend,
        activeSKUs: suppliedCatalog.length
      };
    });
  }, [suppliers, purchaseOrders, products]);

  // Universal Export Handler
  const handleExportCurrentReport = () => {
    switch (activeReport) {
      case 'valuation': {
        const headers = [
          { key: 'category', label: 'Product Category' },
          { key: 'count', label: 'SKU Count' },
          { key: 'units', label: 'Total Units Stored' },
          { key: 'value', label: 'Inventory Capital Value (INR)' }
        ];
        exportToCSV(stats.categoryBreakdown, headers, 'report-inventory-valuation');
        break;
      }
      case 'stock': {
        const headers = [
          { key: 'id', label: 'Product ID' },
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'purchasePrice', label: 'Purchase Cost' },
          { key: 'sellingPrice', label: 'Selling Price' },
          { key: 'stock', label: 'Stock Units' },
          { key: 'minStockLevel', label: 'Min Level' }
        ];
        exportToCSV(productStockData, headers, 'report-product-stock-status');
        break;
      }
      case 'low_stock': {
        const headers = [
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'stock', label: 'Current Units' },
          { key: 'minStockLevel', label: 'Threshold' }
        ];
        exportToCSV(lowStockData, headers, 'report-low-stock-items');
        break;
      }
      case 'out_of_stock': {
        const headers = [
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'minStockLevel', label: 'Target Restock Level' }
        ];
        exportToCSV(outOfStockData, headers, 'report-out-of-stock-critical');
        break;
      }
      case 'warehouse': {
        const headers = [
          { key: 'id', label: 'Warehouse ID' },
          { key: 'name', label: 'Facility Name' },
          { key: 'location', label: 'Location' },
          { key: 'managerName', label: 'Manager' },
          { key: 'currentStockUnits', label: 'Occupied Units' },
          { key: 'storageCapacity', label: 'Storage Capacity' },
          { key: 'occupancyRate', label: 'Occupancy %' },
          { key: 'totalValue', label: 'Stored Valuation (INR)' }
        ];
        exportToCSV(warehouseReportData, headers, 'report-warehouse-capacity');
        break;
      }
      case 'movement': {
        const headers = [
          { key: 'id', label: 'Transaction ID' },
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'productName', label: 'Product' },
          { key: 'warehouseName', label: 'Warehouse' },
          { key: 'quantity', label: 'Quantity Shift' },
          { key: 'notes', label: 'Audit Reference' }
        ];
        exportToCSV(movementReportData, headers, 'report-stock-movement');
        break;
      }
      case 'purchase_orders': {
        const headers = [
          { key: 'id', label: 'PO ID' },
          { key: 'orderDate', label: 'Date' },
          { key: 'supplierId', label: 'Supplier' },
          { key: 'status', label: 'Status' },
          { key: 'totalAmount', label: 'Total Value (INR)' }
        ];
        exportToCSV(poReportData, headers, 'report-purchase-orders-summary');
        break;
      }
      case 'suppliers': {
        const headers = [
          { key: 'id', label: 'Supplier ID' },
          { key: 'companyName', label: 'Company' },
          { key: 'name', label: 'Contact' },
          { key: 'email', label: 'Email' },
          { key: 'totalOrders', label: 'Total POs Placed' },
          { key: 'totalSpend', label: 'Cumulative Spend (INR)' },
          { key: 'activeSKUs', label: 'Active SKUs' }
        ];
        exportToCSV(supplierReportData, headers, 'report-suppliers-performance');
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Reports & Business Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time data intelligence for capital valuation, inventory turnover, procurement spend, and warehouse occupancy
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Download}
          onClick={handleExportCurrentReport}
          className="shadow-sm"
        >
          Export Active Report (CSV)
        </Button>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center overflow-x-auto gap-1">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT 1: INVENTORY VALUATION */}
      {activeReport === 'valuation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card bodyClassName="p-4 bg-blue-50/50 border-blue-100">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Total Portfolio Valuation</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {formatCurrency(stats.totalStockValue, settings.currency)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">At standard procurement purchase prices</span>
            </Card>
            <Card bodyClassName="p-4 bg-emerald-50/50 border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Average SKU Valuation</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {formatCurrency(products.length ? stats.totalStockValue / products.length : 0, settings.currency)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Mean investment per active product line</span>
            </Card>
            <Card bodyClassName="p-4 bg-purple-50/50 border-purple-100">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Total Units Held</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {formatNumber(stats.totalStockUnits)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Distributed across 3 regional facilities</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Valuation by Product Category" subtitle="Capital commitment across merchandise lines" headerIcon={BarChart3}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valuationData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, settings.currency), 'Capital Valuation']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="valuation" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Category Capital Breakdown" subtitle="Detailed breakdown of stock values and quantities" headerIcon={FileSpreadsheet} bodyClassName="p-0">
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">SKUs</th>
                      <th className="p-3 text-right">Units</th>
                      <th className="p-3 text-right">Total Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.categoryBreakdown.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{cat.category}</td>
                        <td className="p-3 text-right text-slate-600">{cat.count}</td>
                        <td className="p-3 text-right text-slate-600">{formatNumber(cat.units)}</td>
                        <td className="p-3 text-right font-extrabold text-slate-900">{formatCurrency(cat.value, settings.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* REPORT 2: PRODUCT STOCK STATUS */}
      {activeReport === 'stock' && (
        <div className="space-y-4">
          <Card bodyClassName="p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...stats.categoryBreakdown.map(c => ({ value: c.category, label: c.category }))
                ]}
              />
              <Select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Warehouses' },
                  ...warehouses.map(w => ({ value: w.id, label: w.name }))
                ]}
              />
            </div>
          </Card>

          <Card bodyClassName="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Product SKU</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Cost Price</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-right">Available Units</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productStockData.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                      <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3.5 text-slate-600">{p.category}</td>
                      <td className="p-3.5 text-right text-slate-600">{formatCurrency(p.purchasePrice, settings.currency)}</td>
                      <td className="p-3.5 text-right text-slate-900 font-semibold">{formatCurrency(p.sellingPrice, settings.currency)}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">{formatNumber(p.stock)}</td>
                      <td className="p-3.5 text-right">
                        <Badge
                          variant={p.stock <= 0 ? 'danger' : p.stock <= p.minStockLevel ? 'warning' : 'success'}
                          size="sm"
                        >
                          {p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStockLevel ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 3: LOW STOCK ALERTS */}
      {activeReport === 'low_stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>{lowStockData.length} products</strong> have stock levels at or below their designated threshold. Prompt replenishment recommended.
              </span>
            </div>
          </div>

          <Card bodyClassName="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Current Stock</th>
                    <th className="p-3.5 text-right">Min Threshold</th>
                    <th className="p-3.5 text-right">Shortage Deficit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockData.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40">
                      <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                      <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3.5 text-slate-600">{p.category}</td>
                      <td className="p-3.5 text-right font-extrabold text-amber-700">{p.stock} units</td>
                      <td className="p-3.5 text-right text-slate-600">{p.minStockLevel} units</td>
                      <td className="p-3.5 text-right font-bold text-rose-600">
                        -{Math.max(0, p.minStockLevel - p.stock)} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 4: OUT OF STOCK */}
      {activeReport === 'out_of_stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>{outOfStockData.length} items</strong> are completely depleted (0 inventory units). Customer fulfillment is stalled.
            </span>
          </div>

          <Card bodyClassName="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">SKU</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Purchase Price</th>
                    <th className="p-3.5 text-right">Selling Price</th>
                    <th className="p-3.5 text-right">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outOfStockData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No out of stock items found. All products have active units!
                      </td>
                    </tr>
                  ) : (
                    outOfStockData.map((p) => (
                      <tr key={p.id} className="hover:bg-rose-50/40">
                        <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3.5 text-slate-600">{p.category}</td>
                        <td className="p-3.5 text-right text-slate-600">{formatCurrency(p.purchasePrice, settings.currency)}</td>
                        <td className="p-3.5 text-right text-slate-900 font-semibold">{formatCurrency(p.sellingPrice, settings.currency)}</td>
                        <td className="p-3.5 text-right font-extrabold text-rose-600">0 units</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 5: WAREHOUSE CAPACITY */}
      {activeReport === 'warehouse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouseReportData.map((wh) => (
              <Card key={wh.id} title={wh.name} subtitle={wh.location.split(',')[0]} headerIcon={Warehouse}>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stored Units:</span>
                    <strong className="text-slate-900">{formatNumber(wh.currentStockUnits)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Capacity:</span>
                    <strong className="text-slate-900">{formatNumber(wh.storageCapacity)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility Valuation:</span>
                    <strong className="text-blue-900 font-bold">{formatCurrency(wh.totalValue, settings.currency)}</strong>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Occupancy:</span>
                      <strong>{wh.occupancyRate}%</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${wh.occupancyRate}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* REPORT 6: STOCK MOVEMENT */}
      {activeReport === 'movement' && (
        <div className="space-y-6">
          <Card title="Monthly Stock Inflow vs Outflow" subtitle="Aggregate unit movements across procurement and dispatch" headerIcon={TrendingUp}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyMovement}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val) => [`${val} units`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="stockIn" fill="#10b981" radius={[6, 6, 0, 0]} name="Inflow (Stock In)" />
                  <Bar dataKey="stockOut" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Outflow (Stock Out)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 7: PURCHASE ORDERS */}
      {activeReport === 'purchase_orders' && (
        <div className="space-y-4">
          <Card bodyClassName="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">PO Number</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5 text-right">Items</th>
                    <th className="p-3.5 text-right">Total Committed</th>
                    <th className="p-3.5 text-right">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {poReportData.map((po) => {
                    const sup = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{po.id}</td>
                        <td className="p-3.5 text-slate-500">{formatDate(po.orderDate, false)}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{sup?.companyName || po.supplierId}</td>
                        <td className="p-3.5 text-right text-slate-600">{po.items?.length || 0} lines</td>
                        <td className="p-3.5 text-right font-extrabold text-slate-900">{formatCurrency(po.totalAmount, settings.currency)}</td>
                        <td className="p-3.5 text-right">
                          <Badge variant={po.status === 'Received' ? 'success' : po.status === 'Pending' ? 'warning' : 'default'} size="sm">
                            {po.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* REPORT 8: SUPPLIER PERFORMANCE */}
      {activeReport === 'suppliers' && (
        <div className="space-y-4">
          <Card bodyClassName="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Supplier Vendor</th>
                    <th className="p-3.5">Contact Lead</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 text-right">Active SKUs</th>
                    <th className="p-3.5 text-right">Orders Placed</th>
                    <th className="p-3.5 text-right">Total Procurement Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierReportData.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{s.companyName}</td>
                      <td className="p-3.5 text-slate-600">{s.name}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{s.email}</td>
                      <td className="p-3.5 text-right text-slate-700 font-semibold">{s.activeSKUs} items</td>
                      <td className="p-3.5 text-right text-slate-700">{s.totalOrders} POs</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">
                        {formatCurrency(s.totalSpend, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
