import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  PackageCheck,
  AlertCircle,
  MapPin,
  RefreshCw,
  FileText,
  User,
  Phone,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [mobileInput, setMobileInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mobile order history
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { socket } = useSocket();

  const handleTrack = async (idToTrack = orderIdInput, mobileToUse = mobileInput) => {
    if (!idToTrack.trim()) {
      setError('Please enter your Order ID.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.trackOrder(idToTrack.trim(), mobileToUse.trim());
      if (res.success && res.order) {
        setOrder(res.order);
        // Join socket room for live updates
        if (socket) {
          socket.emit('join_order_room', res.order.orderId);
        }
      } else {
        setError(res.error || 'Order not found.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Error tracking order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if orderId in query params
  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  // Listen for real-time status updates via WebSockets
  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = (data) => {
      if (order && data.orderId === order.orderId) {
        setOrder((prev) => ({
          ...prev,
          printingStatus: data.printingStatus,
          paymentStatus: data.paymentStatus,
          collectionStatus: data.collectionStatus,
        }));
      }
    };

    socket.on('order_status_updated', onOrderUpdate);

    return () => {
      socket.off('order_status_updated', onOrderUpdate);
    };
  }, [socket, order]);

  // Handle Search History by Mobile
  const handleHistorySearch = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobileInput.trim())) {
      setError('Please enter a valid 10-digit mobile number to search your order history.');
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await api.getMyOrders(mobileInput.trim());
      if (res.success) {
        setHistoryOrders(res.orders);
      }
    } catch (err) {
      setError('Could not retrieve history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Compute Active Step in Stepper (0 to 3)
  const getStepIndex = () => {
    if (!order) return 0;
    if (order.collectionStatus === 'READY' || order.collectionStatus === 'COLLECTED') return 3;
    if (order.printingStatus === 'PRINTING') return 2;
    if (order.printingStatus === 'QUEUED' || order.printingStatus === 'PAID') return 1;
    if (order.paymentStatus === 'PAID') return 1;
    return 0;
  };

  const steps = [
    { title: 'Payment Confirmed', desc: 'Verified securely online' },
    { title: 'Order Queued', desc: 'Sent to Print Spooler' },
    { title: 'Printing Documents', desc: 'Physical sheets printing' },
    { title: 'Ready for Collection', desc: 'At SAC Xerox Counter' },
  ];

  const currentStep = getStepIndex();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Search Header Box */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-brand-100 dark:border-dark-border p-6 shadow-sm">
        <h1 className="text-2xl font-black text-brand-800 dark:text-white tracking-tight">
          Track Your Print Order
        </h1>
        <p className="text-brand-600/70 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Enter your Order ID (e.g. XR20261116001) or mobile number to see real-time printing progress.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. XR20261116001)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-100 dark:border-dark-border bg-white dark:bg-dark-surface text-brand-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
            />
          </div>

          <div className="relative sm:w-48">
            <Phone className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" />
            <input
              type="tel"
              placeholder="Mobile (Optional)"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-100 dark:border-dark-border bg-white dark:bg-dark-surface text-brand-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>Track Now</span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Live Order Display */}
      {order && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-brand-100 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-100 dark:border-dark-border">
            <div>
              <span className="text-xs font-bold text-brand-400 dark:text-slate-400 uppercase tracking-wider block">
                Order Reference
              </span>
              <span className="text-2xl font-black text-brand-500 dark:text-brand-300 font-mono tracking-wide">
                {order.orderId}
              </span>
              <div className="flex items-center gap-2 text-xs text-brand-600/70 dark:text-slate-400 mt-1">
                <span>Customer: <strong className="text-brand-800 dark:text-slate-200">{order.customerName}</strong></span>
                <span>•</span>
                <span>Mobile: <strong className="text-brand-800 dark:text-slate-200">{order.mobileNumber}</strong></span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-brand-400 dark:text-slate-400 uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <span className="text-2xl font-black text-brand-800 dark:text-white">
                ₹{order.grandTotal.toFixed(2)}
              </span>
              <span className="block text-xs text-brand-600/70 dark:text-slate-400 font-medium">
                {order.totalPhysicalSheets} Physical Sheets
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div>
            <h3 className="text-sm font-bold text-brand-800 dark:text-slate-100 mb-6">Live Print Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((st, idx) => {
                const isPassed = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 shadow-sm ring-2 ring-brand-500/20'
                        : isPassed
                        ? 'border-brand-200 dark:border-brand-800/60 bg-brand-50/40 dark:bg-brand-950/30 text-brand-800 dark:text-brand-300'
                        : 'border-brand-100 dark:border-dark-border bg-brand-50/20 dark:bg-dark-surface/50 text-slate-400 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2.5 font-bold text-xs ${
                        isPassed
                          ? 'bg-brand-500 text-white'
                          : isCurrent
                          ? 'bg-brand-500 text-white animate-pulse shadow-md shadow-brand-500/40'
                          : 'bg-brand-100 dark:bg-dark-border text-brand-400 dark:text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-brand-800 dark:text-slate-100">{st.title}</h4>
                    <p className="text-[11px] text-brand-600/70 dark:text-slate-400 mt-0.5">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection Alert Box */}
          {order.collectionStatus === 'READY' && (
            <div className="p-5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border-2 border-brand-300 dark:border-brand-800 text-brand-800 dark:text-brand-200 flex items-start gap-4">
              <PackageCheck className="w-8 h-8 text-brand-500 dark:text-brand-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold">
                  Your documents are ready! Please collect them from the CampusPrint shop.
                </h4>
                <p className="text-xs text-brand-600 dark:text-brand-300 mt-1">
                  Location: SAC Ground Floor Xerox Center. Mention Order ID <strong className="font-mono">{order.orderId}</strong> at the counter.
                </p>
              </div>
            </div>
          )}

          {/* Printed Items Breakdown */}
          <div className="pt-4 border-t border-brand-100 dark:border-dark-border">
            <h4 className="text-xs font-bold text-brand-800 dark:text-slate-100 uppercase tracking-wider mb-3">
              Documents in this Order
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-brand-50/50 dark:bg-dark-surface border border-brand-100 dark:border-dark-border text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span className="font-bold text-brand-800 dark:text-slate-100">{item.originalName}</span>
                  </div>
                  <div className="text-brand-600/70 dark:text-slate-400">
                    <span>{item.printType === 'COLOUR' ? 'Colour' : 'B&W'} • {item.printSides === 'DOUBLE' ? 'Double' : 'Single'}</span>
                    <span className="ml-2 font-bold text-brand-800 dark:text-slate-200">{item.physicalSheets} Sheets (₹{item.itemTotal.toFixed(2)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Lookup Box */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-brand-100 dark:border-dark-border p-6">
        <h3 className="text-sm font-bold text-brand-800 dark:text-slate-100">Need to find previous print orders?</h3>
        <p className="text-xs text-brand-600/70 dark:text-slate-400 mt-1">
          Search all print orders associated with your 10-digit mobile number.
        </p>
        <button
          onClick={handleHistorySearch}
          disabled={historyLoading}
          className="mt-3 px-4 py-2 rounded-xl bg-white dark:bg-dark-surface border border-brand-100 dark:border-dark-border hover:bg-brand-50 dark:hover:bg-dark-border text-xs font-bold text-brand-800 dark:text-slate-200 transition-colors shadow-sm"
        >
          {historyLoading ? 'Loading History...' : 'View My Order History'}
        </button>

        {historyOrders.length > 0 && (
          <div className="mt-4 space-y-2">
            {historyOrders.map((h, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setOrderIdInput(h.orderId);
                  handleTrack(h.orderId, h.mobileNumber);
                }}
                className="p-3 bg-white dark:bg-dark-surface rounded-xl border border-brand-100 dark:border-dark-border hover:border-brand-500 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-brand-500 dark:text-brand-300">{h.orderId}</span>
                  <span className="ml-2 text-brand-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-800 dark:text-slate-200">₹{h.grandTotal}</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-dark-card text-brand-700 dark:text-slate-300 font-bold uppercase text-[10px] border border-brand-100 dark:border-dark-border">
                    {h.printingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
