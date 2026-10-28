import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  User,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Save,
  Building,
  Mail,
  Phone,
  FileSpreadsheet
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { storageService } from '../services/storageService';

export const Settings = () => {
  const { settings, updateSettings, resetToDemo, importDatabase } = useInventory();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('store');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Business & System form state
  const [storeForm, setStoreForm] = useState({
    businessName: settings.businessName || '',
    businessAddress: settings.businessAddress || '',
    phone: settings.phone || '',
    email: settings.email || '',
    gstNumber: settings.gstNumber || '',
    currency: settings.currency || 'INR',
    lowStockThreshold: settings.lowStockThreshold || 20
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  const handleSaveStore = (e) => {
    e.preventDefault();
    updateSettings({
      businessName: storeForm.businessName.trim(),
      businessAddress: storeForm.businessAddress.trim(),
      phone: storeForm.phone.trim(),
      email: storeForm.email.trim(),
      gstNumber: storeForm.gstNumber.trim(),
      currency: storeForm.currency,
      lowStockThreshold: Number(storeForm.lowStockThreshold) || 20
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      role: profileForm.role.trim()
    });
    addToast('Profile updated successfully!', 'success');
  };

  const handleConfirmReset = () => {
    resetToDemo();
    setIsResetModalOpen(false);
  };

  const handleExportJSON = () => {
    storageService.exportDatabaseJSON();
    addToast('Database JSON backup downloaded!', 'success');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const ok = importDatabase(parsed);
        if (ok) {
          // re-sync store form
          if (parsed.settings) {
            setStoreForm(parsed.settings);
          }
        }
      } catch (err) {
        addToast('Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Data Control
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure business metadata, inventory threshold policies, operator profiles, and database backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'store'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          Store & Policy Settings
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Operator Profile
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Management
        </button>
      </div>

      {/* TAB 1: STORE & POLICY SETTINGS */}
      {activeTab === 'store' && (
        <Card title="Retail Entity Configuration" subtitle="Enterprise business profile and default inventory threshold rules">
          <form onSubmit={handleSaveStore} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Registered Business Name"
                value={storeForm.businessName}
                onChange={(e) => setStoreForm({ ...storeForm, businessName: e.target.value })}
                required
              />

              <Input
                label="GSTIN / Business Registration"
                value={storeForm.gstNumber}
                onChange={(e) => setStoreForm({ ...storeForm, gstNumber: e.target.value })}
              />
            </div>

            <Input
              label="Headquarters Physical Address"
              value={storeForm.businessAddress}
              onChange={(e) => setStoreForm({ ...storeForm, businessAddress: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Contact Email"
                type="email"
                value={storeForm.email}
                onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                required
              />

              <Input
                label="Official Contact Phone"
                value={storeForm.phone}
                onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Select
                label="Currency Standard"
                value={storeForm.currency}
                onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                options={[
                  { value: 'INR', label: 'Indian Rupee (₹ INR)' },
                  { value: 'USD', label: 'US Dollar ($ USD)' },
                  { value: 'EUR', label: 'Euro (€ EUR)' },
                  { value: 'GBP', label: 'British Pound (£ GBP)' }
                ]}
              />

              <Input
                label="Global Low Stock Alert Threshold (Units)"
                type="number"
                min="5"
                max="500"
                value={storeForm.lowStockThreshold}
                onChange={(e) => setStoreForm({ ...storeForm, lowStockThreshold: e.target.value })}
                helperText="Items with total units ≤ this threshold trigger dashboard notifications"
                required
              />
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary" icon={Save}>
                Save Policy Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: OPERATOR PROFILE */}
      {activeTab === 'profile' && (
        <Card title="Operator Account Profile" subtitle="Active administrator session details">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {profileForm.name ? profileForm.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{profileForm.name || 'System Administrator'}</h4>
                <p className="text-xs text-slate-500">{profileForm.email || 'admin@retailflow.com'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {profileForm.role || 'Inventory Lead'}
                </span>
              </div>
            </div>

            <Input
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />

            <Input
              label="Account Work Email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />

            <Input
              label="Administrative Role"
              value={profileForm.role}
              onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
              required
            />

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary" icon={Save}>
                Update Profile Information
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: DATABASE MANAGEMENT */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Reset Demo Data Card */}
          <Card
            title="Reset Sample Demo Data"
            subtitle="Restore all 30+ products, warehouses, suppliers, transactions, and orders to original pristine state"
            headerIcon={RotateCcw}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold text-sm">Restore Seed Dataset</p>
                  <p className="mt-0.5 leading-relaxed">
                    This action will wipe any locally created products or changes and re-populate the complete initial Agile Capstone dataset.
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                size="md"
                icon={RotateCcw}
                onClick={() => setIsResetModalOpen(true)}
                className="shrink-0"
              >
                Reset Demo Data
              </Button>
            </div>
          </Card>

          {/* Backup & Restore Card */}
          <Card
            title="Database Backup & JSON Portability"
            subtitle="Download full snapshot of application state or restore from a previously exported JSON backup"
            headerIcon={Database}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                    <Download className="w-4 h-4 text-blue-600" /> Export JSON Snapshot
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Saves all products, warehouse balances, supplier contracts, purchase orders, and audit transactions into a clean JSON file.
                  </p>
                </div>
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportJSON}>
                  Download Backup (.json)
                </Button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                    <Upload className="w-4 h-4 text-emerald-600" /> Import JSON Backup
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Restore application state directly from a valid RetailFlow JSON snapshot backup file.
                  </p>
                </div>
                <label className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Select JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Demo Data to Pristine State?"
        message="Are you sure you want to restore the initial demo data? All products, warehouses, purchase orders, and stock movements will be reset to their original academic evaluation values."
        confirmText="Confirm Reset"
        confirmVariant="danger"
      />
    </div>
  );
};
