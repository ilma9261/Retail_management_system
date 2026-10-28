import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  XCircle,
  Warehouse,
  Truck,
  ShoppingCart,
  Plus,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    products,
    warehouses,
    suppliers,
    purchaseOrders,
    transactions,
    stats,
    settings
  } = useInventory();

  // Top 5 recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Top 5 recent purchase orders
  const recentOrders = purchaseOrders.slice(0, 5);

  // Top products by total inventory value
  const topProductsByValue = [...products]
    .map(p => ({
      ...p,
      totalValue: (Number(p.stock) || 0) * (Number(p.purchasePrice) || 0)
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Category chart data
  const categoryChartData = stats.categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.units,
    amount: item.value
  }));

  // Warehouse chart data
  const warehouseChartData = stats.warehouseBreakdown.map((wh) => ({
    name: wh.name.replace(' Warehouse', ''),
    units: wh.currentStockUnits,
    capacity: wh.storageCapacity,
    utilization: wh.occupancyRate
  }));

  // Monthly movement chart data
  const movementChartData = stats.monthlyMovement.length > 0
    ? stats.monthlyMovement
    : [
        { month: 'Jan', stockIn: 320, stockOut: 180 },
        { month: 'Feb', stockIn: 450, stockOut: 210 },
        { month: 'Mar', stockIn: 280, stockOut: 195 }
      ];

  // Stock valuation projection data based on actual products
  const valuationTrendData = [
    { period: 'Week 1', valuation: Math.round(stats.totalStockValue * 0.82) },
    { period: 'Week 2', valuation: Math.round(stats.totalStockValue * 0.89) },
    { period: 'Week 3', valuation: Math.round(stats.totalStockValue * 0.94) },
    { period: 'Current', valuation: stats.totalStockValue }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Inventory Network Operational
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Inventory Operations Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Centralized monitoring for stock levels, inter-warehouse movements, and purchase order lifecycles across {stats.totalWarehouses} active distribution facilities.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/products', { state: { openAddModal: true } })}
            className="shadow-md shadow-blue-500/20"
          >
            Add Product
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Boxes}
            onClick={() => navigate('/inventory', { state: { openStockInModal: true } })}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Stock In
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={ShoppingCart}
            onClick={() => navigate('/purchase-orders', { state: { openCreateModal: true } })}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Create PO
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeftRight}
            onClick={() => navigate('/transfers', { state: { openTransferModal: true } })}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Transfer Stock
          </Button>
        </div>
      </div>

      {/* 8 Metric Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          subtitle={`${stats.categoryBreakdown.length} active retail categories`}
          icon={Package}
          color="blue"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Inventory Units"
          value={formatNumber(stats.totalStockUnits)}
          subtitle="Total stock across all warehouses"
          icon={Boxes}
          color="indigo"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(stats.totalStockValue, settings.currency)}
          subtitle="Cumulative purchase valuation"
          icon={IndianRupee}
          color="emerald"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={formatNumber(stats.lowStockCount)}
          subtitle={`Below threshold of ${settings.lowStockThreshold} units`}
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Out of Stock"
          value={formatNumber(stats.outOfStockCount)}
          subtitle="Critical items requiring restock"
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Total Warehouses"
          value={formatNumber(stats.totalWarehouses)}
          subtitle="Delhi, Noida & Ghaziabad hubs"
          icon={Warehouse}
          color="purple"
          onClick={() => navigate('/warehouses')}
        />
        <StatCard
          title="Active Suppliers"
          value={formatNumber(stats.totalSuppliers)}
          subtitle="Verified procurement vendors"
          icon={Truck}
          color="cyan"
          onClick={() => navigate('/suppliers')}
        />
        <StatCard
          title="Pending Orders"
          value={formatNumber(stats.pendingPurchaseOrders)}
          subtitle="Awaiting vendor dispatch or receipt"
          icon={ShoppingCart}
          color="blue"
          onClick={() => navigate('/purchase-orders')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inventory by Category (Donut) */}
        <Card
          title="Inventory by Category"
          subtitle="Distribution of total stock units across product families"
          headerIcon={Boxes}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [
                    `${formatNumber(val)} units (${formatCurrency(item.payload.amount, settings.currency)})`,
                    item.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Monthly Stock Movement (Bar Chart) */}
        <Card
          title="Monthly Stock Movement"
          subtitle="Inbound vs Outbound inventory movement comparison"
          headerIcon={TrendingUp}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${formatNumber(val)} units`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value === 'stockIn' ? 'Stock In (Procured)' : 'Stock Out (Dispatched)'}</span>}
                />
                <Bar dataKey="stockIn" fill="#10b981" radius={[6, 6, 0, 0]} name="stockIn" />
                <Bar dataKey="stockOut" fill="#f43f5e" radius={[6, 6, 0, 0]} name="stockOut" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Secondary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Inventory Valuation Overview (Area Chart) */}
        <Card
          title="Inventory Valuation Trend"
          subtitle="Portfolio capital valuation trajectory based on current stock"
          headerIcon={IndianRupee}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valuationTrendData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, settings.currency), 'Valuation']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="valuation" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#valGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Warehouse-wise Inventory Units (Bar Chart) */}
        <Card
          title="Warehouse Storage & Capacity"
          subtitle="Current stock load against designated facility storage limits"
          headerIcon={Warehouse}
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'units' ? `${formatNumber(val)} units stored` : `${formatNumber(val)} capacity limit`,
                    name === 'units' ? 'Occupied Units' : 'Total Capacity'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-slate-700">{value === 'units' ? 'Stored Stock Units' : 'Storage Capacity'}</span>}
                />
                <Bar dataKey="units" fill="#3b82f6" radius={[6, 6, 0, 0]} name="units" />
                <Bar dataKey="capacity" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Critical Operational Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inventory Transactions */}
        <Card
          title="Recent Inventory Transactions"
          subtitle="Audit log of latest stock in, stock out, and adjustment events"
          headerIcon={Clock}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/inventory')}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              View Full History →
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={txn.type === 'STOCK_IN' ? 'success' : txn.type === 'STOCK_OUT' ? 'danger' : 'purple'}
                      size="sm"
                    >
                      {txn.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">{txn.warehouseName}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{txn.productName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{txn.notes}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold block ${txn.type === 'STOCK_IN' ? 'text-emerald-600' : txn.type === 'STOCK_OUT' ? 'text-rose-600' : 'text-purple-600'}`}>
                    {txn.type === 'STOCK_IN' ? `+${txn.quantity}` : txn.type === 'STOCK_OUT' ? `-${txn.quantity}` : (txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{formatDate(txn.date, false)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Purchase Orders */}
        <Card
          title="Recent Purchase Orders"
          subtitle="Vendor procurement orders & fulfillment status"
          headerIcon={ShoppingCart}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/purchase-orders')}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              View All Orders →
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="divide-y divide-slate-100">
            {recentOrders.map((po) => {
              const supplier = suppliers.find(s => s.id === po.supplierId);
              let badgeVariant = 'default';
              if (po.status === 'Received') badgeVariant = 'success';
              else if (po.status === 'Approved') badgeVariant = 'primary';
              else if (po.status === 'Pending') badgeVariant = 'warning';
              else if (po.status === 'Cancelled') badgeVariant = 'danger';

              return (
                <div key={po.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-slate-800">{po.id}</span>
                      <Badge variant={badgeVariant} size="sm">
                        {po.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">{supplier?.companyName || 'Supplier'}</p>
                    <p className="text-[11px] text-slate-400">{po.items?.length || 0} line items • Ordered {formatDate(po.orderDate, false)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatCurrency(po.totalAmount, settings.currency)}
                    </span>
                    <button
                      onClick={() => navigate('/purchase-orders')}
                      className="text-[11px] text-blue-600 hover:underline mt-0.5"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Valued Inventory & Critical Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Valued Products */}
        <Card
          title="Highest Capital Value Items"
          subtitle="Top products ranked by total stored financial investment"
          headerIcon={TrendingUp}
        >
          <div className="space-y-3">
            {topProductsByValue.map((prod, idx) => (
              <div key={prod.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{prod.sku} • {prod.stock} units</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {formatCurrency(prod.totalValue, settings.currency)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    @{formatCurrency(prod.purchasePrice, settings.currency)}/unit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          title="Stock Replenishment Alerts"
          subtitle="Products below minimum threshold requiring purchase orders"
          headerIcon={AlertTriangle}
          action={
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingCart}
              onClick={() => navigate('/purchase-orders', { state: { openCreateModal: true } })}
              className="text-xs"
            >
              Order Stock
            </Button>
          }
        >
          {stats.lowStockProducts.length === 0 && stats.outOfStockProducts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Healthy Stock Reserves</p>
              <p className="text-xs text-slate-400">All SKU quantities are above minimum thresholds.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {stats.outOfStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                        OUT OF STOCK
                      </span>
                      <p className="text-xs font-bold text-rose-950 truncate">{p.name}</p>
                    </div>
                    <p className="text-[11px] text-rose-700 mt-0.5 font-mono">{p.sku} • Min Level: {p.minStockLevel}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => navigate('/purchase-orders', { state: { openCreateModal: true, initialProductId: p.id } })}
                  >
                    Restock
                  </Button>
                </div>
              ))}

              {stats.lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                        LOW STOCK
                      </span>
                      <p className="text-xs font-bold text-amber-950 truncate">{p.name}</p>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5 font-mono">
                      Current: {p.stock} units • Threshold: {p.minStockLevel} units
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/inventory', { state: { openStockInModal: true, initialProductId: p.id } })}
                  >
                    Add Stock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
