import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Package,
  ExternalLink,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { formatCurrency } from '../../utils/formatters';

const ROUTE_TITLES = {
  '/': 'Dashboard Overview',
  '/products': 'Product Catalog Management',
  '/inventory': 'Stock Control & Adjustments',
  '/warehouses': 'Warehouse Locations & Capacity',
  '/transfers': 'Inter-Warehouse Transfers',
  '/suppliers': 'Supplier Directory & Contacts',
  '/purchase-orders': 'Purchase Orders & Receiving',
  '/reports': 'Reports & Analytics Intelligence',
  '/settings': 'System Settings & Data Control'
};

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, products, settings } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const title = ROUTE_TITLES[location.pathname] || 'RetailFlow Inventory';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            {settings.businessName} • Central Retail Hub
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search SKU, item, category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-36 sm:w-60 md:w-72 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-slate-200/80 placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Quick Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 flex justify-between items-center">
                <span>Matching Products ({searchResults.length})</span>
                <span className="text-[10px] text-slate-400">Click to view in Products</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No products found matching "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate('/products', { state: { highlightId: p.id } });
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{p.sku} • {p.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-900">{formatCurrency(p.sellingPrice, settings.currency)}</p>
                        <p className={`text-[10px] font-semibold ${p.stock <= 0 ? 'text-rose-600' : p.stock <= p.minStockLevel ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {p.stock} in stock
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown (Low Stock & Alerts) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Alerts and Notifications"
          >
            <Bell className="w-5 h-5" />
            {stats.lowStockCount + stats.outOfStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Inventory Alerts</span>
                </div>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                  {stats.lowStockCount + stats.outOfStockCount} items
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {stats.outOfStockProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/inventory');
                    }}
                    className="p-3 hover:bg-rose-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded mb-1">
                        OUT OF STOCK
                      </span>
                      <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{p.sku}</p>
                    </div>
                    <span className="text-xs font-bold text-rose-600 shrink-0">0 units</span>
                  </div>
                ))}

                {stats.lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate('/inventory');
                    }}
                    className="p-3 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded mb-1">
                        LOW STOCK ALERT
                      </span>
                      <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{p.sku}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 shrink-0">
                      {p.stock} left (Min: {p.minStockLevel})
                    </span>
                  </div>
                ))}

                {stats.lowStockCount === 0 && stats.outOfStockCount === 0 && (
                  <div className="py-8 px-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">All Stock Levels Healthy</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No critical stock warnings.</p>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/inventory');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Full Stock Monitor →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@retailflow.com'}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Settings
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
