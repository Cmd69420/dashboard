import { useEffect, useState } from "react";

const API_BASE = "https://backup-server-q2dc.onrender.com";
const LMS_BASE = "https://lisence-system.onrender.com";

export default function BillingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyLicense, setCompanyLicense] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [renewType, setRenewType] = useState("manual");

  // Get authentication token from various sources
  useEffect(() => {
    const token = 
      sessionStorage.getItem("token") || 
      window.authToken ||
      document.cookie.split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1] ||
      new URLSearchParams(window.location.search).get('token');

    if (!token) {
      setError("No authentication token found. Please login first.");
      setLoading(false);
      return;
    }

    setAuthToken(token);
  }, []);

  // Check for purchase success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') === 'success') {
      setPurchaseSuccess(true);
      setTimeout(() => setPurchaseSuccess(false), 5000);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  /* ================= FETCH COMPANY LICENSE ================= */
  useEffect(() => {
    if (!authToken) return;

    const fetchLicense = async () => {
      try {
        const res = await fetch(`${API_BASE}/licenses/my-license`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          if (res.status === 404) {
            // No license yet - this is OK for new users
            setCompanyLicense(null);
            return;
          }
          throw new Error(`Failed to fetch license: HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("📄 COMPANY LICENSE:", data);
        setCompanyLicense(data);
      } catch (err) {
        console.error("Failed to load company license:", err);
        setCompanyLicense(null);
      }
    };

    fetchLicense();
  }, [authToken]);

  /* ================= FETCH USER COUNT ================= */
  useEffect(() => {
    if (!authToken) return;

    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/licenses/my-license/user-count`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch user count: HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("👥 USER COUNT:", data);
        setUserCount(data);
      } catch (err) {
        console.error("Failed to load user count:", err);
      }
    };

    fetchUserCount();
  }, [authToken]);

  /* ================= FETCH PLANS FROM LMS ================= */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(
          `${LMS_BASE}/api/license/licenses-by-product/69589d3ba7306459dd47fd87`
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch plans: HTTP ${res.status}`);
        }

        const data = await res.json();

        const transformedPlans = (data?.licenses || []).map((plan) => ({
          ...plan,
          licenseType: plan.licenseType,
        }));

        setPlans(transformedPlans);
      } catch (err) {
        console.error("Failed to load plans:", err);
        setError(err.message);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* ================= HELPERS ================= */
  const isCurrentPlan = (plan) => {
    if (!companyLicense?.license?.plan) return false;
    if (!plan?.licenseType?.name) return false;

    return (
      companyLicense.license.plan.toLowerCase() === 
      plan.licenseType.name.toLowerCase()
    );
  };

  const openModal = (plan) => {
    const currentPlan = companyLicense?.license?.plan || "";
    const isRenew = currentPlan.toLowerCase() === plan.licenseType?.name.toLowerCase();

    setSelectedPlan({
      licenseTypeId: plan.licenseType._id,
      name: plan.licenseType?.name,
      price: plan.licenseType?.price?.amount,
      isRenew,
      maxUsers: plan.maxLimits?.users,
    });

    setRenewType("manual");
    setShowModal(true);
  };

  const handleProceed = async () => {
    setProcessingPayment(true);

    try {
      console.log("Processing payment for:", {
        licenseTypeId: selectedPlan.licenseTypeId,
        renewType,
        isRenew: selectedPlan.isRenew,
        price: selectedPlan.price,
        companyId: companyLicense?.company?.id,
        companySubdomain: companyLicense?.company?.subdomain,
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual payment gateway integration
      // const paymentResponse = await fetch(`${API_BASE}/api/payments/create`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     licenseTypeId: selectedPlan.licenseTypeId,
      //     renewType,
      //     isRenew: selectedPlan.isRenew
      //   })
      // });

      setShowModal(false);
      setProcessingPayment(false);
      setPurchaseSuccess(true);
      
      // Refresh license data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Payment failed:", err);
      setProcessingPayment(false);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !plans.length) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Plans</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ================= SUCCESS MESSAGE ================= */}
      {purchaseSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-semibold text-green-800">Purchase Successful!</h3>
              <p className="text-sm text-green-600">
                Your plan has been activated. Refreshing page...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= LICENSE STATUS BANNER ================= */}
      {companyLicense?.license ? (
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          companyLicense.license.isExpired 
            ? 'bg-red-50 border-red-300' 
            : companyLicense.license.isExpiringSoon 
            ? 'bg-yellow-50 border-yellow-300' 
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {companyLicense.license.isExpired ? '⚠️' : 
                   companyLicense.license.isExpiringSoon ? '⏰' : '✅'}
                </span>
                <h3 className="font-semibold text-lg">
                  {companyLicense.company.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Current Plan: <strong className="text-indigo-600">{companyLicense.license.plan}</strong>
              </p>
              <p className="text-sm text-gray-600">
                License Key: <code className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono">
                  {companyLicense.license.licenseKey}
                </code>
              </p>
            </div>
            <div className="text-right">
              {companyLicense.license.expiresAt ? (
                <>
                  <p className="text-sm text-gray-600">
                    {companyLicense.license.isExpired ? '❌ Expired on' : '📅 Expires on'}
                  </p>
                  <p className={`font-semibold ${
                    companyLicense.license.isExpired ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {new Date(companyLicense.license.expiresAt).toLocaleDateString()}
                  </p>
                  {!companyLicense.license.isExpired && (
                    <p className={`text-xs mt-1 ${
                      companyLicense.license.isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      ({companyLicense.license.daysUntilExpiry} days remaining)
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">♾️ No expiry</p>
              )}
            </div>
          </div>

          {companyLicense.license.isExpired && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Your license has expired. Please renew to continue using all features.
              </p>
            </div>
          )}

          {companyLicense.license.isExpiringSoon && !companyLicense.license.isExpired && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⏰ Your license expires soon. Consider renewing to avoid service interruption.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-800">No Active License</h3>
              <p className="text-sm text-blue-600">
                Choose a plan below to get started with all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= USER COUNT ================= */}
      {userCount && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Current Users</p>
              <p className="text-3xl font-bold text-blue-600">{userCount.currentUsers}</p>
            </div>
            <div className="text-center border-x border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Max Allowed</p>
              <p className="text-3xl font-bold text-indigo-600">
                {userCount.maxAllowedUsers || '∞'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Available Slots</p>
              <p className="text-3xl font-bold text-green-600">
                {userCount.availableSlots ?? '∞'}
              </p>
            </div>
          </div>
          {userCount.isAtCapacity && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center font-medium">
                ⚠️ User limit reached. Upgrade your plan to add more users.
              </p>
            </div>
          )}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">Choose Your Plan</h2>

      {plans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📦</div>
          <p>No plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const type = plan.licenseType || {};
            const active = isCurrentPlan(plan);

            return (
              <div
                key={plan._id}
                className={`rounded-2xl p-6 bg-white relative transition-all hover:scale-105 ${
                  active ? 'ring-4 ring-green-500' : 'shadow-lg'
                }`}
              >
                {active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 
                      bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-4 py-1.5 rounded-full shadow-lg font-semibold">
                    ✓ ACTIVE PLAN
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-500 min-h-[40px]">
                    {type.description || "Perfect for your needs"}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg text-gray-600">₹</span>
                    <span className="text-4xl font-bold text-gray-900">
                      {type.price?.amount ?? 0}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    per {type.price?.billingPeriod || "month"}
                  </p>
                </div>

                {Array.isArray(type.features) && type.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {type.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-gray-700">{f.uiLabel || f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {plan.maxLimits && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Max Users:</span>
                      <span className="font-semibold text-gray-900">{plan.maxLimits.users}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-semibold text-gray-900">{plan.maxLimits.storageGB} GB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">API Calls/month:</span>
                      <span className="font-semibold text-gray-900">
                        {plan.maxLimits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {active && companyLicense?.license?.expiresAt && (
                  <p className="text-xs text-center text-green-700 mb-3 bg-green-50 py-2 rounded-lg">
                    {companyLicense.license.isExpired ? '🔴 Expired on' : '🔄 Renews on'}{" "}
                    <strong>
                      {new Date(companyLicense.license.expiresAt).toLocaleDateString()}
                    </strong>
                  </p>
                )}

                <button
                  onClick={() => !active && openModal(plan)}
                  disabled={active}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    active
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {active ? '✓ Current Plan' : (companyLicense?.license ? 'Upgrade Plan' : 'Get Started')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= PURCHASE MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            {/* HEADER */}
            <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {selectedPlan?.isRenew ? "🔄 Renew Subscription" : "🚀 Upgrade Plan"}
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    {selectedPlan?.name}
                  </p>
                </div>
                <button 
                  onClick={() => !processingPayment && setShowModal(false)}
                  disabled={processingPayment}
                  className="text-white hover:text-gray-200 text-2xl disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">
              {/* Renewal Type Toggle */}
              <div className="relative bg-gray-100 rounded-xl p-1 flex">
                <div
                  className={`absolute top-1 left-1 h-[42px] w-1/2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ${
                    renewType === "auto" ? "translate-x-full" : ""
                  }`}
                />

                <button
                  className={`relative z-10 flex-1 h-10 font-semibold transition-colors ${
                    renewType === "manual"
                      ? "text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  onClick={() => setRenewType("manual")}
                  disabled={processingPayment}
                >
                  Manual Renewal
                </button>

                <button
                  className={`relative z-10 flex-1 h-10 font-semibold transition-colors ${
                    renewType === "auto"
                      ? "text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  onClick={() => setRenewType("auto")}
                  disabled={processingPayment}
                >
                  Auto Renewal
                </button>
              </div>

              {/* Renewal Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
                {renewType === "manual" ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-900 font-medium">
                      <span>📝</span>
                      <span>Manual Renewal</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      You'll need to renew manually when your subscription expires. 
                      No automatic charges will be made.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-900 font-medium">
                      <span>🔄</span>
                      <span>Automatic Renewal</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Your subscription will automatically renew before expiry. 
                      You can disable this anytime from your account settings.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                <p className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  <span>Order Summary</span>
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-lg text-purple-600">₹{selectedPlan?.price}</span>
                  </div>
                  {selectedPlan?.maxUsers && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Users:</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.maxUsers}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPlan?.isRenew ? '🔄 Renewal' : '⬆️ Upgrade'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={processingPayment}
                className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleProceed}
                disabled={processingPayment}
                className="flex-1 px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}