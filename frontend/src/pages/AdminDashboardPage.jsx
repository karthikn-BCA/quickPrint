import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  ShoppingBag,
  Eye,
  RotateCcw,
  Settings,
  LogOut,
  RefreshCw,
  DollarSign,
  Sun,
  Moon,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { adminUser, logout, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'settings'
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
      fetchOrders();
    }
  }, [isAuthenticated, statusFilter]);

  // Real-time socket events for admin dashboard
  useEffect(() => {
    if (!socket) return;

    socket.on('admin_new_order', () => {
      fetchOrders();
      fetchDashboardData();
    });

    socket.on('admin_order_updated', () => {
      fetchOrders();
      fetchDashboardData();
    });

    return () => {
      socket.off('admin_new_order');
      socket.off('admin_order_updated');
    };
  }, [socket]);

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
    <div className="min-h-screen bg-cp-bg flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-cp-sidebar-bg text-cp-sidebar-text flex flex-col shrink-0 border-r border-cp-sidebar-border">
        <div className="p-5 border-b border-cp-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage dark:bg-aquamarine flex items-center justify-center text-white font-bold shadow-md">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm uppercase">CampusPrint</h2>
              <p className="text-[11px] text-sage-pale dark:text-copper font-semibold">Shopkeeper Admin</p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sage-pale dark:text-copper border border-white/20 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-copper" /> : <Moon className="w-4 h-4 text-sage-pale" />}
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'orders'
                ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                : 'text-cp-sidebar-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'settings'
                ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                : 'text-cp-sidebar-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pricing & Shop</span>
          </button>
        </nav>

        {/* Printer Status Badge */}
        <div className="p-4 border-t border-cp-sidebar-border">
          <div className="bg-black/20 rounded-xl p-3 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cp-sidebar-muted font-semibold">Print Agent:</span>
              <span className="flex items-center gap-1 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="text-[11px] text-cp-sidebar-muted font-medium truncate">
              {stats?.printerStatus?.printerName || 'Campus Spooler'}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-cp-sidebar-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 rounded-xl transition-colors"
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
            <h1 className="text-2xl font-black text-cp-text tracking-tight">
              {activeTab === 'orders' ? 'Print Orders & Queue' : 'Shop & Pricing Management'}
            </h1>
            <p className="text-cp-text-secondary text-xs sm:text-sm mt-0.5">
              Logged in as <strong className="text-cp-text">{adminUser?.name || 'Administrator'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchDashboardData();
                fetchOrders();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cp-surface border border-cp-border text-cp-text hover:bg-cp-surface-alt text-xs font-bold shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sage dark:text-copper" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cp-surface p-5 rounded-2xl border border-cp-border shadow-soft">
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-2xl font-black text-cp-text mt-1 block">
                {stats.totalOrders}
              </span>
              <span className="text-[11px] text-sage dark:text-copper font-bold mt-1 block">
                {stats.todayOrders} Orders Today
              </span>
            </div>

            <div className="bg-cp-surface p-5 rounded-2xl border border-cp-border shadow-soft">
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Printing / Queued
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                {stats.printingOrders + stats.pendingOrders}
              </span>
              <span className="text-[11px] text-cp-text-muted mt-1 block font-medium">
                Auto spooler active
              </span>
            </div>

            <div className="bg-cp-surface p-5 rounded-2xl border border-cp-border shadow-soft">
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Ready to Collect
              </span>
              <span className="text-2xl font-black text-sage dark:text-copper mt-1 block">
                {stats.readyOrders}
              </span>
              <span className="text-[11px] text-cp-text-muted mt-1 block font-medium">
                {stats.completedOrders} Collected Total
              </span>
            </div>

            <div className="bg-cp-surface p-5 rounded-2xl border border-cp-border shadow-soft">
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-black text-sage dark:text-copper mt-1 block">
                ₹{stats.totalRevenue.toFixed(2)}
              </span>
              <span className="text-[11px] text-sage dark:text-copper font-bold mt-1 block">
                ₹{stats.todayRevenue.toFixed(2)} Today
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: Orders Queue */}
        {activeTab === 'orders' && (
          <div className="bg-cp-surface rounded-2xl border border-cp-border shadow-soft overflow-hidden space-y-4">
            {/* Filters Bar */}
            <div className="p-4 sm:p-5 border-b border-cp-border flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage dark:text-copper" />
                <input
                  type="text"
                  placeholder="Search Order ID / Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-medium"
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
                        ? 'bg-sage dark:bg-aquamarine text-white shadow-sm'
                        : 'bg-cp-surface-alt text-cp-text hover:bg-cp-border'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cp-text">
                <thead className="bg-cp-surface-alt text-cp-text font-bold uppercase tracking-wider border-b border-cp-border">
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
                <tbody className="divide-y divide-cp-border">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-cp-text-secondary font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sage dark:text-copper" />
                        Loading print queue...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-cp-text-secondary font-bold">
                        No orders matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-cp-surface-alt/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-sage dark:text-copper">
                          {ord.orderId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-cp-text">{ord.customerName}</div>
                          <div className="text-[11px] text-cp-text-muted font-mono">{ord.mobileNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate font-medium text-cp-text" title={ord.items?.map((it) => it.originalName).join(', ')}>
                            {ord.items?.length} File(s)
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-cp-text">
                          {ord.totalPhysicalSheets}
                        </td>
                        <td className="py-3 px-4 font-black text-cp-text">
                          ₹{ord.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.collectionStatus === 'READY'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : ord.collectionStatus === 'COLLECTED'
                                ? 'bg-cp-surface-alt text-cp-text-muted font-bold'
                                : ord.printingStatus === 'PRINTING'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse font-bold'
                                : ord.printingStatus === 'QUEUED'
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                : ord.printingStatus === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold'
                                : 'bg-cp-surface-alt text-cp-text-muted'
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
                              className="p-1.5 text-cp-text-secondary hover:text-cp-text rounded-lg hover:bg-cp-surface-alt"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {ord.collectionStatus !== 'READY' && ord.collectionStatus !== 'COLLECTED' && (
                            <button
                              onClick={() => handleMarkPrinted(ord.orderId)}
                              className="px-2.5 py-1 rounded-lg bg-cp-surface-alt text-sage dark:text-copper hover:bg-cp-border font-bold text-[11px] border border-cp-border"
                              title="Mark as Printed"
                            >
                              Print Done
                            </button>
                          )}
                          {ord.collectionStatus === 'READY' && (
                            <button
                              onClick={() => handleMarkCollected(ord.orderId)}
                              className="px-2.5 py-1 rounded-lg bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-bold text-[11px] shadow-sm"
                              title="Handover to Student"
                            >
                              Handover
                            </button>
                          )}
                          {ord.printingStatus === 'FAILED' && (
                            <button
                              onClick={() => handleRetryPrint(ord.orderId)}
                              className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg"
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
            <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft">
              <div className="flex items-center gap-2 pb-4 border-b border-cp-border">
                <DollarSign className="w-5 h-5 text-sage dark:text-copper" />
                <h3 className="font-bold text-cp-text text-base">Modify Campus Pricing</h3>
              </div>

              <form onSubmit={handleSavePricing} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cp-text mb-1">
                      B&W Single (₹)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={pricingForm.bwSingle}
                      onChange={(e) => setPricingForm({ ...pricingForm, bwSingle: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cp-text mb-1">
                      B&W Double (₹)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={pricingForm.bwDouble}
                      onChange={(e) => setPricingForm({ ...pricingForm, bwDouble: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-cp-text mb-1">
                      Colour Single (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={pricingForm.colSingle}
                      onChange={(e) => setPricingForm({ ...pricingForm, colSingle: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cp-text mb-1">
                      Colour Double (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={pricingForm.colDouble}
                      onChange={(e) => setPricingForm({ ...pricingForm, colDouble: e.target.value })}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-cp-border bg-cp-surface text-cp-text focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-bold"
                    />
                  </div>
                </div>

                {saveMessage && (
                  <div className="p-3 bg-cp-surface-alt text-sage dark:text-copper border border-cp-border rounded-xl text-xs font-bold">
                    {saveMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-xs shadow-md transition-all"
                >
                  Save and Apply Pricing Globally
                </button>
              </form>
            </div>

            {/* Shop Details Info */}
            <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-cp-text text-base pb-3 border-b border-cp-border">
                Shop Operating Info
              </h3>
              <div className="space-y-3 text-xs text-cp-text-secondary font-medium">
                <div>
                  <span className="font-bold text-cp-text block">Shop Location:</span>
                  <span>{settings?.campusLocation || 'Student Activity Centre (SAC)'}</span>
                </div>
                <div>
                  <span className="font-bold text-cp-text block">Operating Hours:</span>
                  <span>{settings?.operatingHours || 'Mon-Sat: 8:30 AM - 7:00 PM'}</span>
                </div>
                <div>
                  <span className="font-bold text-cp-text block">Print Agent API Key:</span>
                  <span className="font-mono bg-cp-surface-alt px-2 py-0.5 rounded text-cp-text border border-cp-border">
                    cp_agent_key_campusprint_secure_2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cp-surface rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-cp-border">
              <div className="px-5 py-4 border-b border-cp-border flex items-center justify-between bg-cp-surface-alt">
                <h3 className="font-bold text-cp-text text-sm truncate">{previewDoc.originalName}</h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-cp-text-secondary hover:text-cp-text p-1"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-cp-bg">
                <iframe
                  src={api.getDocumentPreviewUrl(previewDoc._id)}
                  className="w-full h-[65vh] border border-cp-border rounded-lg bg-cp-surface"
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
