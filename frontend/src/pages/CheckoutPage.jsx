import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, Phone, Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle, CreditCard, Zap } from 'lucide-react';
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
        <h2 className="text-xl font-bold text-slate-800">No items to checkout</h2>
        <p className="text-slate-500 text-sm mt-2">Please upload at least one document first.</p>
        <Link
          to="/upload"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm"
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
            color: '#4F46E5',
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping Cart
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Customer Information Form */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Customer Details</h2>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                10-Digit Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to verify pickup & track order status in real time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional receipt)</span>
              </label>
              <input
                type="email"
                placeholder="rahul.student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || loadingEstimate}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
                isProcessing || loadingEstimate
                  ? 'bg-slate-400 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{pricingEstimate.grandTotal.toFixed(2)} & Print</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Review Summary */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
            Order Review
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((it, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 truncate">{it.originalName}</div>
                <div className="flex justify-between text-slate-500">
                  <span>
                    {it.printType === 'COLOUR' ? 'Colour' : 'B&W'} • {it.printSides === 'DOUBLE' ? 'Double-sided' : 'Single'} • {it.copies} {it.copies === 1 ? 'Copy' : 'Copies'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {it.pageSelection === 'CUSTOM' ? `Pages: ${it.customPages}` : `${it.pageCount} Pages`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Physical Sheets:</span>
              <span className="font-bold text-slate-800">{pricingEstimate.totalPhysicalSheets}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pickup Counter:</span>
              <span className="font-semibold text-indigo-700">SAC Xerox Shop</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total Payable:</span>
              <span className="font-black text-indigo-600 text-xl">
                ₹{pricingEstimate.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automatic printer dispatch immediately after payment!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
