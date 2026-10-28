import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  ArrowLeftRight,
  Truck,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
  LogOut,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/inventory', label: 'Inventory', icon: Boxes, badgeKey: 'lowStock' },
  { path: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, badgeKey: 'pendingOrders' },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { stats } = useInventory();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                Retail<span className="text-blue-400">Flow</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Inventory Pro
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            let badge = null;
            if (item.badgeKey === 'lowStock' && stats.lowStockCount > 0) {
              badge = (
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.lowStockCount}
                </span>
              );
            } else if (item.badgeKey === 'pendingOrders' && stats.pendingPurchaseOrders > 0) {
              badge = (
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {stats.pendingPurchaseOrders}
                </span>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
                {badge}
              </NavLink>
            );
          })}
        </div>

        {/* System & Agile Capstone Banner */}
        <div className="px-4 py-3 mx-3 mb-3 bg-slate-800/40 border border-slate-800 rounded-xl text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px] mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Agile Capstone Build
          </div>
          <p className="text-[11px] leading-tight text-slate-400">
            Enterprise Tier • 100% localStorage Sync
          </p>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
