import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Printer,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  RotateCcw,
  PackageCheck,
  Settings,
  LogOut,
  RefreshCw,
  Sliders,
  DollarSign,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { adminUser, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('orders'); // 'overview' | 'orders' | 'settings'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Settings & Pricing State
  const [settings, setSettings] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    bwSingle: 2,
    bwDouble: 2,
    colSingle: 10,
    colDouble: 10,
  });
  const [saveMessage, setSaveMessage] = useState('');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch Stats & Settings
  const fetchDashboardData = async () => {
    try {
      const [statsRes, settingsRes] = await Promise.all([
        api.getAdminStats(),
        api.getShopSettings(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
        if (settingsRes.settings.pricing) {
          setPricingForm(settingsRes.settings.pricing);
        }
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getAdminOrders({
        status: statusFilter,
        search: searchTerm,
      });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, statusFilter]);

  // Real-time socket events for admin dashboard
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_admin_room');

    const handleNewOrder = () => {
      fetchDashboardData();
      fetchOrders();
    };

    const handleStatusChange = () => {
      fetchDashboardData();
      fetchOrders();
    };

    const handlePrinterChange = (data) => {
      setStats((prev) => (prev ? { ...prev, printerStatus: data } : prev));
    };

    socket.on('new_paid_order', handleNewOrder);
    socket.on('job_status_change', handleStatusChange);
    socket.on('printer_status_change', handlePrinterChange);

    return () => {
      socket.off('new_paid_order', handleNewOrder);
      socket.off('job_status_change', handleStatusChange);
      socket.off('printer_status_change', handlePrinterChange);
    };
  }, [socket]);

  // Order Actions
  const handleMarkPrinted = async (orderId) => {
    try {
      const res = await api.markOrderPrinted(orderId);
      if (res.success) {
        fetchOrders();
        fetchDashboardData();
      }
    } catch (e) {
      alert('Error updating order: ' + e.message);
    }
  };

  const handleMarkCollected = async (orderId) => {
    try {
      const res = await api.markOrderCollected(orderId);
      if (res.success) {
        fetchOrders();
        fetchDashboardData();
      }
    } catch (e) {
      alert('Error updating order: ' + e.message);
    }
  };

  const handleRetryPrint = async (orderId) => {
    try {
      const res = await api.retryPrintJob(orderId);
      if (res.success) {
        alert(`Print job for ${orderId} dispatched to printer agent.`);
        fetchOrders();
      }
    } catch (e) {
      alert('Error retrying print job: ' + e.message);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateShopSettings({
        pricing: {
          bwSingle: Number(pricingForm.bwSingle),
          bwDouble: Number(pricingForm.bwDouble),
          colSingle: Number(pricingForm.colSingle),
          colDouble: Number(pricingForm.colDouble),
        },
      });
      if (res.success) {
        setSaveMessage('Pricing updated successfully! Customers will see these rates immediately.');
        setTimeout(() => setSaveMessage(''), 4000);
      }
    } catch (e) {
      alert('Failed to update pricing: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-dark-surface text-slate-300 dark:text-slate-400 flex flex-col shrink-0 border-r border-slate-800 dark:border-dark-border">
        <div className="p-5 border-b border-slate-800 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm uppercase">CampusPrint</h2>
              <p className="text-[11px] text-brand-400">Shopkeeper Admin</p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 dark:bg-dark-card hover:bg-slate-700 text-amber-400 border border-slate-700 dark:border-dark-border transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 dark:hover:bg-dark-card'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 dark:hover:bg-dark-card'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pricing & Shop</span>
          </button>
        </nav>

        {/* Printer Status Badge */}
        <div className="p-4 border-t border-slate-800 dark:border-dark-border">
          <div className="bg-slate-800/80 dark:bg-dark-card rounded-xl p-3 border border-slate-700/60 dark:border-dark-border space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Print Agent:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {stats?.printerStatus?.printerName || 'Campus Spooler'}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 dark:border-dark-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'orders' ? 'Print Orders & Queue' : 'Shop & Pricing Management'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Logged in as <strong className="text-slate-800 dark:text-slate-200">{adminUser?.name || 'Administrator'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchDashboardData();
                fetchOrders();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-surface text-xs font-bold shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200/90 dark:border-dark-border shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {stats.totalOrders}
              </span>
              <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold mt-1 block">
                {stats.todayOrders} Orders Today
              </span>
            </div>

            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200/90 dark:border-dark-border shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Printing / Queued
              </span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">
                {stats.printingOrders + stats.pendingOrders}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Auto spooler active
              </span>
            </div>

            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200/90 dark:border-dark-border shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Ready to Collect
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {stats.readyOrders}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {stats.completedOrders} Collected Total
              </span>
            </div>

            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200/90 dark:border-dark-border shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1 block">
                ₹{stats.totalRevenue.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                ₹{stats.todayRevenue.toFixed(2)} Today
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: Orders Queue */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200/90 dark:border-dark-border shadow-sm overflow-hidden space-y-4">
            {/* Filters Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-dark-border flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Order ID / Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {['ALL', 'QUEUED', 'PRINTING', 'READY', 'COLLECTED', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      statusFilter === st
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-dark-surface text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-dark-border">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4">Sheets</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
                        Loading print queue...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No orders matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50/70 dark:hover:bg-dark-surface/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                          {ord.orderId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-400">{ord.mobileNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate" title={ord.items?.map((it) => it.originalName).join(', ')}>
                            {ord.items?.length} File(s)
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                          {ord.totalPhysicalSheets}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          ₹{ord.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.collectionStatus === 'READY'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : ord.collectionStatus === 'COLLECTED'
                                ? 'bg-slate-100 dark:bg-dark-surface text-slate-700 dark:text-slate-300'
                                : ord.printingStatus === 'PRINTING'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                                : ord.printingStatus === 'QUEUED'
                                ? 'bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300'
                                : ord.printingStatus === 'FAILED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-dark-surface text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {ord.collectionStatus === 'READY'
                              ? 'READY'
                              : ord.collectionStatus === 'COLLECTED'
                              ? 'COLLECTED'
                              : ord.printingStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {ord.items?.[0]?.document?._id && (
                            <button
                              onClick={() => setPreviewDoc(ord.items[0].document)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {ord.collectionStatus !== 'READY' && ord.collectionStatus !== 'COLLECTED' && (
                            <button
                              onClick={() => handleMarkPrinted(ord.orderId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800/50"
                              title="Mark as Printed"
                            >
                              Print Done
                            </button>
                          )}
                          {ord.collectionStatus === 'READY' && (
                            <button
                              onClick={() => handleMarkCollected(ord.orderId)}
                              className="px-2.5 py-1 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-bold text-[11px] shadow-sm"
                              title="Handover to Student"
                            >
                              Handover
                            </button>
                          )}
                          {ord.printingStatus === 'FAILED' && (
                            <button
                              onClick={() => handleRetryPrint(ord.orderId)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                              title="Retry Print"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Settings & Pricing Modifier */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pricing Editor */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200/90 dark:border-dark-border p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-dark-border">
                <DollarSign className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Modify Campus Pricing</h3>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      B&W Single (₹)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={pricingForm.bwSingle}
                      onChange={(e) => setPricingForm({ ...pricingForm, bwSingle: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      B&W Double (₹)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={pricingForm.bwDouble}
                      onChange={(e) => setPricingForm({ ...pricingForm, bwDouble: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Colour Single (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={pricingForm.colSingle}
                      onChange={(e) => setPricingForm({ ...pricingForm, colSingle: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Colour Double (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={pricingForm.colDouble}
                      onChange={(e) => setPricingForm({ ...pricingForm, colDouble: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {saveMessage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs font-bold">
                    {saveMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-black text-xs shadow-md transition-all"
                >
                  Save and Apply Pricing Globally
                </button>
              </form>
            </div>

            {/* Shop Details Info */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200/90 dark:border-dark-border p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-dark-border">
                Shop Operating Info
              </h3>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Shop Location:</span>
                  <span>{settings?.campusLocation || 'Student Activity Centre (SAC)'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Operating Hours:</span>
                  <span>{settings?.operatingHours || 'Mon-Sat: 8:30 AM - 7:00 PM'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Print Agent API Key:</span>
                  <span className="font-mono bg-slate-100 dark:bg-dark-surface px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border">
                    cp_agent_key_campusprint_secure_2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-dark-border">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50 dark:bg-dark-surface">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{previewDoc.originalName}</h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-dark-bg">
                <iframe
                  src={api.getDocumentPreviewUrl(previewDoc._id)}
                  className="w-full h-[65vh] border rounded-lg bg-white dark:bg-dark-surface"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
