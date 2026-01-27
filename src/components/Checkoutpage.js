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

const API_BASE_URL = "https://backup-server-q2dc.onrender.com";

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
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, netbanking
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

  // Card details
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // UPI details
  const [upiId, setUpiId] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Pre-fill billing info from localStorage or company data
    const userEmail = localStorage.getItem("userEmail") || "";
    const userName = localStorage.getItem("userName") || "";
    const companyName = localStorage.getItem("companyName") || "";
    
    setBillingInfo(prev => ({
      ...prev,
      email: userEmail,
      name: userName || companyName,
    }));
  }, []);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d{0,16}$/.test(value)) {
      setCardDetails(prev => ({
        ...prev,
        number: formatCardNumber(value)
      }));
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardDetails(prev => ({
        ...prev,
        expiry: formatExpiry(value)
      }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setCardDetails(prev => ({
        ...prev,
        cvv: value
      }));
    }
  };

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

    // Validate payment method
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        setError("Please fill in all card details");
        return false;
      }

      if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        setError("Please enter a valid 16-digit card number");
        return false;
      }

      if (cardDetails.cvv.length < 3) {
        setError("Please enter a valid CVV");
        return false;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId || !upiId.includes('@')) {
        setError("Please enter a valid UPI ID");
        return false;
      }
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
      // Prepare payment payload
      const paymentPayload = {
        orderType: orderData.type, // 'plan', 'slot-expansion', 'renewal'
        orderDetails: orderData.details,
        amount: orderData.totalAmount,
        billingInfo,
        paymentMethod,
        paymentDetails: paymentMethod === "card" ? {
          last4: cardDetails.number.slice(-4),
          cardName: cardDetails.name,
        } : paymentMethod === "upi" ? {
          upiId
        } : {},
      };

      // Call payment processing endpoint
      const response = await fetch(`${API_BASE_URL}/api/payments/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment processing failed");
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentSuccess(true);

      // Call success callback after short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        }
      }, 2000);

    } catch (err) {
      console.error("Payment error:", err);
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
            Complete your purchase securely
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

            {/* Payment Method */}
            <NeumorphicCard>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    boxShadow: '3px 3px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1e293b' }}>
                    Payment Method
                  </h2>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Select your preferred payment method
                  </p>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex gap-3 mb-6">
                {[
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI', icon: Shield },
                  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className="flex-1 p-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={
                      paymentMethod === method.id
                        ? {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '4px 4px 8px rgba(102, 126, 234, 0.4)',
                          }
                        : {
                            background: '#ecf0f3',
                            boxShadow: '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255, 0.8)',
                            color: '#64748b',
                          }
                    }
                  >
                    <method.icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      maxLength="19"
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: '#e6eaf0',
                        border: 'none',
                        color: '#1e293b',
                        boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                      }}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl"
                      style={{
                        background: '#e6eaf0',
                        border: 'none',
                        color: '#1e293b',
                        boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                      }}
                      placeholder="JOHN DOE"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        maxLength="5"
                        className="w-full px-4 py-3 rounded-xl"
                        style={{
                          background: '#e6eaf0',
                          border: 'none',
                          color: '#1e293b',
                          boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                        }}
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                        CVV *
                      </label>
                      <input
                        type="password"
                        required
                        value={cardDetails.cvv}
                        onChange={handleCvvChange}
                        maxLength="4"
                        className="w-full px-4 py-3 rounded-xl"
                        style={{
                          background: '#e6eaf0',
                          border: 'none',
                          color: '#1e293b',
                          boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                        }}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                    placeholder="username@paytm"
                  />
                  <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                    You will be redirected to complete payment
                  </p>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1e293b' }}>
                    Select Your Bank
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: '#e6eaf0',
                      border: 'none',
                      color: '#1e293b',
                      boxShadow: 'inset 4px 4px 8px #c5c8cf, inset -4px -4px 8px #ffffff',
                    }}
                  >
                    <option value="">Choose a bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                  <p className="text-xs mt-2" style={{ color: '#64748b' }}>
                    You will be redirected to your bank's website
                  </p>
                </div>
              )}
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
                  Your payment information is encrypted and secure
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

// Example usage in BillingPlansPage or SlotExpansionPage:
/*
const [showCheckout, setShowCheckout] = useState(false);
const [checkoutData, setCheckoutData] = useState(null);

const handleProceedToCheckout = () => {
  setCheckoutData({
    type: 'plan', // or 'slot-expansion', 'renewal'
    totalAmount: 5000,
    subtotal: 4237,
    tax: 763,
    details: {
      name: 'Business Plan',
      description: 'Professional plan for growing teams',
      items: [
        { name: 'User Slots', quantity: 5, price: 50 },
        { name: 'Client Slots', quantity: 10, price: 10 },
      ]
    }
  });
  setShowCheckout(true);
};

// In your component render:
{showCheckout ? (
  <CheckoutPage
    orderData={checkoutData}
    onBack={() => setShowCheckout(false)}
    onSuccess={(data) => {
      console.log('Payment successful:', data);
      setShowCheckout(false);
      // Refresh plan data or redirect
    }}
  />
) : (
  // Your normal billing page content
)}
*/