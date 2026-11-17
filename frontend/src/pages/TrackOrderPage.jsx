import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Phone, CheckCircle2, PackageCheck, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('id') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [mobileInput, setMobileInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mobile history state
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { joinOrderRoom } = useSocket();

  const handleTrack = async (targetId = orderIdInput, targetMobile = mobileInput) => {
    if (!targetId.trim() && !targetMobile.trim()) {
      setError('Please enter either an Order ID or your Mobile Number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.trackOrder({
        orderId: targetId.trim(),
        mobileNumber: targetMobile.trim(),
      });

      if (res.success && res.order) {
        setOrder(res.order);
        joinOrderRoom(res.order.orderId, (update) => {
          setOrder((prev) => (prev ? { ...prev, ...update } : prev));
        });
      } else {
        setError(res.error || 'No matching order found. Please check your credentials.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Error tracking order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySearch = async () => {
    if (!mobileInput.trim()) {
      setError('Enter your 10-digit mobile number to view order history.');
      return;
    }

    setHistoryLoading(true);
    try {
      const res = await api.getCustomerOrders(mobileInput.trim());
      if (res.success) {
        setHistoryOrders(res.orders);
      }
    } catch (err) {
      setError('Could not retrieve order history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  // Stepper Calculation
  const steps = [
    { title: 'Payment Successful', desc: 'Verified online' },
    { title: 'Order Received', desc: 'Queued at SAC Xerox' },
    { title: 'Printing Document', desc: 'Auto spooler running' },
    { title: 'Ready for Collection', desc: 'Collect at SAC shop' },
  ];

  const getStepIndex = () => {
    if (!order) return 0;
    if (order.collectionStatus === 'READY' || order.collectionStatus === 'COLLECTED') return 3;
    if (order.printingStatus === 'PRINTING') return 2;
    if (order.printingStatus === 'QUEUED' || order.printingStatus === 'PAID') return 1;
    return 0;
  };

  const currentStep = getStepIndex();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Search Header Box */}
      <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft">
        <h1 className="text-2xl font-black text-cp-text tracking-tight">
          Track Your Print Order
        </h1>
        <p className="text-cp-text-secondary text-xs sm:text-sm mt-1">
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
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-cp-primary" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. XR20261116001)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-cp-primary font-mono uppercase"
            />
          </div>

          <div className="relative sm:w-48">
            <Phone className="absolute left-3.5 top-3 w-4 h-4 text-cp-primary" />
            <input
              type="tel"
              placeholder="Mobile (Optional)"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-cp-primary font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-cp-primary hover:bg-cp-primary-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>Track Now</span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Live Order Display */}
      {order && (
        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 sm:p-8 shadow-soft space-y-8 animate-fade-in">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cp-border">
            <div>
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Order Reference
              </span>
              <span className="text-2xl font-black text-cp-primary dark:text-cp-accent font-mono tracking-wide">
                {order.orderId}
              </span>
              <div className="flex items-center gap-2 text-xs text-cp-text-secondary mt-1">
                <span>Customer: <strong className="text-cp-text">{order.customerName}</strong></span>
                <span>•</span>
                <span>Mobile: <strong className="text-cp-text">{order.mobileNumber}</strong></span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-cp-text-muted uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <span className="text-2xl font-black text-cp-text">
                ₹{order.grandTotal.toFixed(2)}
              </span>
              <span className="block text-xs text-cp-text-secondary font-bold">
                {order.totalPhysicalSheets} Physical Sheets
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div>
            <h3 className="text-sm font-bold text-cp-text mb-6">Live Print Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((st, idx) => {
                const isPassed = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'border-cp-primary bg-cp-surface-alt shadow-sm ring-2 ring-cp-primary/20'
                        : isPassed
                        ? 'border-cp-border bg-cp-surface-alt text-cp-text'
                        : 'border-cp-border bg-cp-surface-alt/50 text-cp-text-muted opacity-60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2.5 font-bold text-xs ${
                        isPassed
                          ? 'bg-cp-primary text-white'
                          : isCurrent
                          ? 'bg-cp-primary text-white animate-pulse shadow-md'
                          : 'bg-cp-surface-alt text-cp-text-muted border border-cp-border'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-white" /> : idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-cp-text">{st.title}</h4>
                    <p className="text-[11px] text-cp-text-secondary mt-0.5">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection Alert Box */}
          {order.collectionStatus === 'READY' && (
            <div className="p-5 rounded-2xl bg-cp-surface-alt border-2 border-cp-primary text-cp-text flex items-start gap-4">
              <PackageCheck className="w-8 h-8 text-cp-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-cp-text">
                  Your documents are ready! Please collect them from the CampusPrint shop.
                </h4>
                <p className="text-xs text-cp-text-secondary mt-1">
                  Location: SAC Ground Floor Xerox Center. Mention Order ID <strong className="font-mono text-cp-primary dark:text-cp-accent">{order.orderId}</strong> at the counter.
                </p>
              </div>
            </div>
          )}

          {/* Printed Items Breakdown */}
          <div className="pt-4 border-t border-cp-border">
            <h4 className="text-xs font-bold text-cp-text uppercase tracking-wider mb-3">
              Documents in this Order
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-cp-surface-alt border border-cp-border text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-cp-primary" />
                    <span className="font-bold text-cp-text">{item.originalName}</span>
                  </div>
                  <div className="text-cp-text-secondary font-medium">
                    <span>{item.printType === 'COLOUR' ? 'Colour' : 'B&W'} • {item.printSides === 'DOUBLE' ? 'Double' : 'Single'}</span>
                    <span className="ml-2 font-bold text-cp-text">{item.physicalSheets} Sheets (₹{item.itemTotal.toFixed(2)})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Lookup Box */}
      <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft">
        <h3 className="text-sm font-bold text-cp-text">Need to find previous print orders?</h3>
        <p className="text-xs text-cp-text-secondary mt-1">
          Search all print orders associated with your 10-digit mobile number.
        </p>
        <button
          onClick={handleHistorySearch}
          disabled={historyLoading}
          className="mt-3 px-4 py-2 rounded-xl bg-cp-surface-alt border border-cp-border hover:bg-cp-border text-xs font-bold text-cp-text transition-colors shadow-sm"
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
                className="p-3 bg-cp-surface rounded-xl border border-cp-border hover:border-cp-primary cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-cp-primary dark:text-cp-accent">{h.orderId}</span>
                  <span className="ml-2 text-cp-text-muted font-medium">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-cp-text">₹{h.grandTotal}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cp-surface-alt text-cp-primary-light dark:text-cp-accent border border-cp-border">
                    {h.collectionStatus === 'READY' ? 'READY' : h.printingStatus}
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
