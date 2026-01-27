import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  X,
  AlertCircle,
  Loader,
  Building2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { createOrder, verifyPayment, initializeRazorpay } from '../api/payment';

const API_BASE_URL = "https://backup-server-q2dc.onrender.com";
const RAZORPAY_KEY_ID = "rzp_test_RnRpO2zJanwL9L";

const NeumorphicCard = ({ children, className = "" }) => (
  <div
    className={`p-5 rounded-2xl ${className}`}
    style={{
      background: '#ecf0f3',
      boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255, 0.5)',
      border: '1px solid rgba(255,255,255,0.8)',
    }}
  >
    {children}
  </div>
);

const CheckoutPage = ({ orderData, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  
  // Payment form state
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
  });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");
  const companyName = localStorage.getItem("companyName");

  useEffect(() => {
    // Pre-fill billing info from localStorage
    setBillingInfo(prev => ({
      ...prev,
      email: userEmail || "",
      name: userName || companyName || "",
    }));
  }, []);

  // Load Razorpay script on mount
  useEffect(() => {
    initializeRazorpay();
  }, []);

  const validateForm = () => {
    // Validate billing info
    if (!billingInfo.name || !billingInfo.email || !billingInfo.phone) {
      setError("Please fill in all required billing information");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone
    if (!/^\d{10}$/.test(billingInfo.phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessingPayment(true);
    setError("");

    try {
      // Step 1: Create order on your backend
      const orderResponse = await createOrder({
        userId: userId,
        licenseId: orderData.details.licenseTypeId,
        billingCycle: orderData.details.renewType === 'auto' ? 'monthly' : 'manual',
        amount: orderData.totalAmount,
        orderType: orderData.type, // 'plan', 'slot-expansion', 'renewal'
        orderDetails: {
          ...orderData.details,
          billingInfo,
        },
      });

      console.log("✅ Order created:", orderResponse);

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderResponse.amount, // Amount in paise
        currency: orderResponse.currency || "INR",
        name: "GeoTrack SaaS",
        description: orderData.details.description || `Purchase ${orderData.details.name}`,
        order_id: orderResponse.orderId,
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone,
        },
        theme: {
          color: "#667eea",
        },
        handler: async function (response) {
          console.log("✅ Razorpay response:", response);
          
          try {
            // Step 3: Verify payment on backend
            const verificationResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderData.details,
            });

            console.log("✅ Payment verified:", verificationResponse);

            setTransactionId(verificationResponse.transactionId);
            setPaymentSuccess(true);
            setProcessingPayment(false);

            // Call success callback after short delay
            setTimeout(() => {
              if (onSuccess) {
                onSuccess(verificationResponse);
              }
            }, 2000);
          } catch (err) {
            console.error("❌ Payment verification failed:", err);
            setError("Payment verification failed. Please contact support.");
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log("❌ Payment cancelled by user");
            setProcessingPayment(false);
            setError("Payment was cancelled");
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      console.error("❌ Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
      setProcessingPayment(false);
    }
  };

  // Payment Success Screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ecf0f3' }}>
        <NeumorphicCard className="max-w-2xl w-full">
          <div className="text-center py-12">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                boxShadow: '6px 6px 12px rgba(67, 233, 123, 0.4)',
              }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#1e293b' }}>
              Payment Successful!
            </h2>
            <p className="text-lg mb-6" style={{ color: '#64748b' }}>
              Your order has been confirmed
            </p>
            <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: 'inset 2px 2px 4px rgba(148,163,184,0.2)' }}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>Order Type</p>
                  <p className="font-bold" style={{ color: '#1e293b' }}>{orderData.details.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold mb-1" style={{ color: '#94a3b8' }}>Amount Paid</p>
                  <p className="font-bold text-2xl" style={{ color: '#43e97b' }}>₹{orderData.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              {transactionId && (
                <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: '#e6eaf0' }}>
                  <p style={{ color: '#64748b' }}>Transaction ID: <span className="font-mono font-semibold">{transactionId}</span></p>
                </div>
              )}
            </div>
            <p className="text-sm mb-8" style={{ color: '#64748b' }}>
              A confirmation email has been sent to {billingInfo.email}
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '4px 4px 8px rgba(102, 126, 234, 0.4)',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  // Processing Screen
  if (processingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ecf0f3' }}>
        <NeumorphicCard className="max-w-md w-full">
          <div className="text-center py-12">
            <Loader className="w-16 h-16 mx-auto mb-6 animate-spin" style={{ color: '#667eea' }} />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1e293b' }}>
              Processing Payment
            </h2>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Please do not close this window or press back...
            </p>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ background: '#ecf0f3' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 mb-4"
            style={{
              background: '#ecf0f3',
              boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255, 0.8)',
              color: '#667eea',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold" style={{ color: '#1e293b' }}>
            Secure Checkout
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Complete your purchase securely with Razorpay
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 rounded-2xl border-l-4 flex items-center gap-3"
            style={{
              background: "#fed7d7",
              borderColor: "#fc8181",
            }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#c53030' }} />
            <p style={{ color: "#c53030" }} className="font-medium flex-1">
              {error}
            </p>
            <button onClick={() => setError("")}>
              <X className="w-4 h-4" style={{ color: '#c53030' }} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Information */}
            <NeumorphicCard>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '3px 3px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1e293b' }}>
                    Billing Information
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Enter your billing details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Full Name / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingInfo.name}
                    onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="John Doe / Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={billingInfo.phone}
                    onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={billingInfo.address}
                    onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={billingInfo.state}
                    onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={billingInfo.pincode}
                    onChange={(e) => setBillingInfo({ ...billingInfo, pincode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="400001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={billingInfo.gstNumber}
                    onChange={(e) => setBillingInfo({ ...billingInfo, gstNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </NeumorphicCard>

            {/* Payment Method Notice */}
            <NeumorphicCard>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    boxShadow: '3px 3px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold" style={{ color: '#1e293b' }}>
                    Secure Payment via Razorpay
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Supports Credit/Debit Cards, UPI, Net Banking & Wallets
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            {/* Security Notice */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                background: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <Lock className="w-5 h-5" style={{ color: '#667eea' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                  Secure Payment
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Your payment information is encrypted and secure with Razorpay
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <NeumorphicCard>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1e293b' }}>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#667eea' }}>
                      {orderData.type === 'plan' ? 'Plan' : orderData.type === 'slot-expansion' ? 'Slot Expansion' : 'Service'}
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#1e293b' }}>
                      {orderData.details.name}
                    </p>
                    {orderData.details.description && (
                      <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                        {orderData.details.description}
                      </p>
                    )}
                  </div>

                  {orderData.details.items && orderData.details.items.length > 0 && (
                    <div className="space-y-2">
                      {orderData.details.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                          <span className="text-sm" style={{ color: '#64748b' }}>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4" style={{ borderTop: '2px solid rgba(148, 163, 184, 0.2)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{ color: '#64748b' }}>Subtotal</span>
                      <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                        ₹{orderData.subtotal?.toLocaleString() || orderData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    {orderData.tax && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm" style={{ color: '#64748b' }}>Tax (18%)</span>
                        <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                          ₹{orderData.tax.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                      <span className="text-lg font-bold" style={{ color: '#1e293b' }}>Total</span>
                      <span className="text-2xl font-bold" style={{ color: '#43e97b' }}>
                        ₹{orderData.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || processingPayment}
                  className="w-full px-6 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    boxShadow: '4px 4px 8px rgba(67, 233, 123, 0.4)',
                  }}
                >
                  <Shield className="w-5 h-5" />
                  Pay ₹{orderData.totalAmount.toLocaleString()}
                </button>

                <p className="text-xs text-center mt-4" style={{ color: '#94a3b8' }}>
                  By completing this purchase you agree to our terms and conditions
                </p>
              </NeumorphicCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
//commit