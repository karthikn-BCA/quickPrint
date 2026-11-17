import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowLeft, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, pricingEstimate, loadingEstimate, clearCart, itemCount } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-cp-text">No items to checkout</h2>
        <p className="text-cp-text-secondary text-sm mt-2">Please upload at least one document first.</p>
        <Link
          to="/upload"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-bold text-sm shadow-sm"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobileNumber.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Pending Order on Backend
      const orderPayload = {
        customerName: customerName.trim(),
        mobileNumber: cleanMobile,
        email: email.trim() || undefined,
        items: items.map((it) => ({
          id: it.id,
          documentId: it.id,
          originalName: it.originalName,
          totalPages: it.pageCount,
          printType: it.printType,
          printSides: it.printSides,
          copies: it.copies,
          pageSelection: it.pageSelection,
          customPages: it.customPages,
          orientation: it.orientation,
        })),
      };

      const orderRes = await api.createOrder(orderPayload);
      if (!orderRes.success) {
        throw new Error(orderRes.error || 'Failed to create order on server.');
      }

      const { order, payment } = orderRes;

      // 2. Razorpay Payment Trigger (Live or Test Mode)
      if (payment.isSimulated || !window.Razorpay) {
        // Simulated Gateway Sandbox for developer testing without live bank keys
        const mockPaymentId = `pay_sim_${Date.now()}`;
        const mockSignature = `sim_sig_${Date.now()}`;

        const verifyRes = await api.verifyPayment({
          orderId: order.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        if (verifyRes.success) {
          clearCart();
          navigate(`/order-success/${order.orderId}`, {
            state: { order: verifyRes.order, isSimulated: true },
          });
        } else {
          throw new Error(verifyRes.error || 'Payment signature verification failed.');
        }
      } else {
        // Real Razorpay Test/Production Checkout
        const options = {
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: 'CampusPrint Xerox Center',
          description: `Print Order ${order.orderId}`,
          order_id: payment.razorpayOrderId,
          prefill: {
            name: customerName,
            contact: cleanMobile,
            email: email || '',
          },
          theme: {
            color: '#7B9669',
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.verifyPayment({
                orderId: order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                clearCart();
                navigate(`/order-success/${order.orderId}`, {
                  state: { order: verifyRes.order },
                });
              } else {
                setErrorMessage('Payment verification failed on server: ' + verifyRes.error);
                setIsProcessing(false);
              }
            } catch (vErr) {
              setErrorMessage('Verification failed: ' + vErr.message);
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setErrorMessage(`Payment Failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        rzp.open();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-cp-text-secondary hover:text-sage dark:hover:text-copper mb-6 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping Cart
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Customer Information Form */}
        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 shadow-soft">
          <div className="flex items-center gap-2 pb-4 border-b border-cp-border">
            <User className="w-5 h-5 text-sage dark:text-copper" />
            <h2 className="text-base font-bold text-cp-text">Customer Details</h2>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                10-Digit Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-cp-text">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm pl-12 pr-3.5 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine font-mono"
                />
              </div>
              <p className="text-[11px] text-cp-text-muted mt-1 font-medium">
                Used to verify pickup & track order status in real time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-cp-text mb-1">
                Email Address <span className="text-cp-text-muted font-normal">(Optional receipt)</span>
              </label>
              <input
                type="email"
                placeholder="rahul.student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-cp-border bg-cp-surface text-cp-text placeholder-cp-text-muted focus:outline-none focus:ring-2 focus:ring-sage dark:focus:ring-aquamarine"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || loadingEstimate}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-black text-sm shadow-md transition-all ${
                isProcessing || loadingEstimate
                  ? 'bg-cp-surface-alt cursor-wait text-cp-text-muted border border-cp-border'
                  : 'bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Pay ₹{pricingEstimate.grandTotal.toFixed(2)} & Print</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Review Summary */}
        <div className="bg-cp-surface rounded-2xl border border-cp-border p-6 space-y-4 shadow-soft">
          <h3 className="text-base font-bold text-cp-text pb-3 border-b border-cp-border">
            Order Review
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((it, idx) => (
              <div key={idx} className="bg-cp-surface-alt p-3 rounded-xl border border-cp-border text-xs space-y-1 shadow-sm">
                <div className="font-bold text-cp-text truncate">{it.originalName}</div>
                <div className="flex justify-between text-cp-text-secondary font-medium">
                  <span>
                    {it.printType === 'COLOUR' ? 'Colour' : 'B&W'} • {it.printSides === 'DOUBLE' ? 'Double-sided' : 'Single'} • {it.copies} {it.copies === 1 ? 'Copy' : 'Copies'}
                  </span>
                  <span className="font-bold text-cp-text">
                    {it.pageSelection === 'CUSTOM' ? `Pages: ${it.customPages}` : `${it.pageCount} Pages`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-cp-border space-y-2 text-sm">
            <div className="flex justify-between text-cp-text-secondary font-medium">
              <span>Total Documents</span>
              <span className="font-bold text-cp-text">{itemCount}</span>
            </div>
            <div className="flex justify-between text-cp-text-secondary font-medium">
              <span>Total Physical Sheets</span>
              <span className="font-bold text-cp-text">{pricingEstimate.totalPhysicalSheets}</span>
            </div>
            <div className="pt-2 border-t border-cp-border flex justify-between items-baseline">
              <span className="text-base font-bold text-cp-text">Total Amount</span>
              <span className="text-2xl font-black text-sage dark:text-copper">
                ₹{pricingEstimate.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
