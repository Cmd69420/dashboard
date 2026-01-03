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

  // Get authentication token
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
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch company license
  useEffect(() => {
    if (!authToken) return;

    const fetchLicense = async () => {
      try {
        console.log("🔑 Fetching license with token:", authToken.substring(0, 20) + "...");
        
        const res = await fetch(`${API_BASE}/licenses/my-license`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });

        console.log("📡 License response status:", res.status);

        if (!res.ok) {
          if (res.status === 404) {
            console.log("ℹ️ No license found (404) - this is OK for new users");
            setCompanyLicense(null);
            return;
          }
          const errorText = await res.text();
          console.error("❌ License fetch error:", errorText);
          throw new Error(`Failed to fetch license: HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ COMPANY LICENSE:", data);
        setCompanyLicense(data);
      } catch (err) {
        console.error("❌ Failed to load company license:", err);
        setCompanyLicense(null);
      }
    };

    fetchLicense();
  }, [authToken]);

  // Fetch user count
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

  // Fetch plans from LMS
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

  const isCurrentPlan = (plan) => {
    if (!companyLicense?.license?.plan) return false;
    if (!plan?.licenseType?.name) return false;
    return companyLicense.license.plan.toLowerCase() === plan.licenseType.name.toLowerCase();
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
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowModal(false);
      setProcessingPayment(false);
      setPurchaseSuccess(true);
      
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
      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded-2xl w-1/4 mb-6 neumorphic-inset"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 rounded-3xl neumorphic"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !plans.length) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
        <div className="neumorphic rounded-3xl p-8 bg-red-50">
          <h3 className="text-red-800 font-bold text-xl mb-3">Error Loading Plans</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-2xl font-semibold neumorphic-button hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      {/* Success Message */}
      {purchaseSuccess && (
        <div className="mb-6 p-6 neumorphic rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 animate-pulse">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <h3 className="font-bold text-green-800 text-lg">Purchase Successful!</h3>
              <p className="text-green-600">Your plan has been activated. Refreshing page...</p>
            </div>
          </div>
        </div>
      )}

      {/* License Status Banner */}
      {companyLicense?.license ? (
        <div className={`mb-6 p-6 rounded-3xl neumorphic ${
          companyLicense.license.isExpired 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : companyLicense.license.isExpiringSoon 
            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' 
            : 'bg-gradient-to-br from-green-50 to-emerald-100'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {companyLicense.license.isExpired ? '⚠️' : 
                   companyLicense.license.isExpiringSoon ? '⏰' : '✅'}
                </span>
                <h3 className="font-bold text-2xl text-gray-800">
                  {companyLicense.company.name}
                </h3>
              </div>
              <p className="text-gray-700 mb-2">
                Current Plan: <strong className="text-indigo-700 text-lg">{companyLicense.license.plan}</strong>
              </p>
              <p className="text-gray-600 text-sm">
                License Key: <code className="neumorphic-inset px-3 py-1.5 rounded-xl text-xs font-mono bg-white/50">
                  {companyLicense.license.licenseKey}
                </code>
              </p>
            </div>
            <div className="text-right neumorphic-inset rounded-2xl p-4 bg-white/30">
              {companyLicense.license.expiresAt ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">
                    {companyLicense.license.isExpired ? '❌ Expired on' : '📅 Expires on'}
                  </p>
                  <p className={`font-bold text-lg ${
                    companyLicense.license.isExpired ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {new Date(companyLicense.license.expiresAt).toLocaleDateString()}
                  </p>
                  {!companyLicense.license.isExpired && (
                    <p className={`text-xs mt-2 font-semibold ${
                      companyLicense.license.isExpiringSoon ? 'text-orange-700' : 'text-gray-600'
                    }`}>
                      ({companyLicense.license.daysUntilExpiry} days remaining)
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600 font-semibold">♾️ No expiry</p>
              )}
            </div>
          </div>

          {companyLicense.license.isExpired && (
            <div className="mt-4 p-4 neumorphic-inset rounded-2xl bg-red-100/50">
              <p className="text-red-800 font-semibold">
                ⚠️ Your license has expired. Please renew to continue using all features.
              </p>
            </div>
          )}

          {companyLicense.license.isExpiringSoon && !companyLicense.license.isExpired && (
            <div className="mt-4 p-4 neumorphic-inset rounded-2xl bg-yellow-100/50">
              <p className="text-yellow-800 font-semibold">
                ⏰ Your license expires soon. Consider renewing to avoid service interruption.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-6 neumorphic rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="font-bold text-blue-800 text-lg">No Active License</h3>
              <p className="text-blue-600">Choose a plan below to get started with all features.</p>
            </div>
          </div>
        </div>
      )}

      {/* User Count */}
      {userCount && (
        <div className="mb-6 p-6 neumorphic rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center neumorphic-inset rounded-2xl p-4 bg-white/40">
              <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Current Users</p>
              <p className="text-4xl font-bold text-blue-700">{userCount.currentUsers}</p>
            </div>
            <div className="text-center neumorphic-inset rounded-2xl p-4 bg-white/40">
              <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Max Allowed</p>
              <p className="text-4xl font-bold text-indigo-700">
                {userCount.maxAllowedUsers || '∞'}
              </p>
            </div>
            <div className="text-center neumorphic-inset rounded-2xl p-4 bg-white/40">
              <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Available Slots</p>
              <p className="text-4xl font-bold text-green-700">
                {userCount.availableSlots ?? '∞'}
              </p>
            </div>
          </div>
          {userCount.isAtCapacity && (
            <div className="mt-4 p-3 neumorphic-inset rounded-2xl bg-red-100/50">
              <p className="text-red-700 text-center font-semibold">
                ⚠️ User limit reached. Upgrade your plan to add more users.
              </p>
            </div>
          )}
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 text-gray-800">Choose Your Plan</h2>

      {plans.length === 0 ? (
        <div className="text-center py-12 neumorphic rounded-3xl">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">No plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const type = plan.licenseType || {};
            const active = isCurrentPlan(plan);

            return (
              <div
                key={plan._id}
                className={`rounded-3xl p-8 relative transition-all hover:scale-105 ${
                  active ? 'neumorphic-active bg-gradient-to-br from-green-50 to-emerald-50' : 'neumorphic bg-white'
                }`}
              >
                {active && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 neumorphic-button
                      bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm px-6 py-2 rounded-full font-bold shadow-xl">
                    ✓ ACTIVE PLAN
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{type.name}</h3>
                  <p className="text-gray-600 min-h-[48px]">
                    {type.description || "Perfect for your needs"}
                  </p>
                </div>

                <div className="text-center mb-8 neumorphic-inset rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-xl text-gray-600">₹</span>
                    <span className="text-5xl font-bold text-gray-900">
                      {type.price?.amount ?? 0}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 font-medium">
                    per {type.price?.billingPeriod || "month"}
                  </p>
                </div>

                {Array.isArray(type.features) && type.features.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {type.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-green-600 mt-1 flex-shrink-0 text-lg">✓</span>
                        <span className="text-gray-700">{f.uiLabel || f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {plan.maxLimits && (
                  <div className="neumorphic-inset rounded-2xl p-4 mb-6 space-y-3 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Max Users:</span>
                      <span className="font-bold text-gray-900">{plan.maxLimits.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Storage:</span>
                      <span className="font-bold text-gray-900">{plan.maxLimits.storageGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">API Calls/month:</span>
                      <span className="font-bold text-gray-900">
                        {plan.maxLimits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {active && companyLicense?.license?.expiresAt && (
                  <p className="text-sm text-center text-green-800 mb-4 neumorphic-inset py-3 rounded-2xl font-semibold bg-green-50">
                    {companyLicense.license.isExpired ? '🔴 Expired on' : '🔄 Renews on'}{" "}
                    <strong>
                      {new Date(companyLicense.license.expiresAt).toLocaleDateString()}
                    </strong>
                  </p>
                )}

                <button
                  onClick={() => !active && openModal(plan)}
                  disabled={active}
                  className={`w-full py-4 rounded-2xl font-bold transition-all text-lg ${
                    active
                      ? 'neumorphic-inset bg-green-100 text-green-700 cursor-not-allowed'
                      : 'neumorphic-button bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {active ? '✓ Current Plan' : (companyLicense?.license ? 'Upgrade Plan' : 'Get Started')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="neumorphic rounded-3xl w-full max-w-2xl overflow-hidden animate-scale-in bg-gradient-to-br from-white to-gray-50">
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white neumorphic-inset">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    {selectedPlan?.isRenew ? "🔄 Renew Subscription" : "🚀 Upgrade Plan"}
                  </h3>
                  <p className="text-indigo-100 text-lg">
                    {selectedPlan?.name}
                  </p>
                </div>
                <button 
                  onClick={() => !processingPayment && setShowModal(false)}
                  disabled={processingPayment}
                  className="text-white hover:text-gray-200 text-3xl disabled:opacity-50 neumorphic-button w-12 h-12 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Renewal Type Toggle */}
              <div className="relative neumorphic-inset rounded-2xl p-2 flex bg-gray-100">
                <div
                  className={`absolute top-2 left-2 h-12 w-[calc(50%-8px)] rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 neumorphic-button ${
                    renewType === "auto" ? "translate-x-[calc(100%+8px)]" : ""
                  }`}
                />

                <button
                  className={`relative z-10 flex-1 h-12 font-bold transition-colors rounded-xl ${
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
                  className={`relative z-10 flex-1 h-12 font-bold transition-colors rounded-xl ${
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
              <div className="neumorphic-inset rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                {renewType === "manual" ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-indigo-900 font-bold text-lg">
                      <span>📝</span>
                      <span>Manual Renewal</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      You'll need to renew manually when your subscription expires. 
                      No automatic charges will be made.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-indigo-900 font-bold text-lg">
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
              <div className="neumorphic rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="font-bold text-purple-900 mb-4 flex items-center gap-3 text-lg">
                  <span>📋</span>
                  <span>Order Summary</span>
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Plan:</span>
                    <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Price:</span>
                    <span className="font-bold text-2xl text-purple-700">₹{selectedPlan?.price}</span>
                  </div>
                  {selectedPlan?.maxUsers && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Max Users:</span>
                      <span className="font-bold text-gray-900">{selectedPlan.maxUsers}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-purple-200">
                    <span className="text-gray-600 font-medium">Type:</span>
                    <span className="font-bold text-gray-900">
                      {selectedPlan?.isRenew ? '🔄 Renewal' : '⬆️ Upgrade'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 neumorphic-inset bg-gray-100 flex justify-between gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={processingPayment}
                className="px-8 py-4 rounded-2xl neumorphic-button bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={handleProceed}
                disabled={processingPayment}
                className="flex-1 px-8 py-4 rounded-2xl neumorphic-button bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {processingPayment ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
        .neumorphic {
          box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6),
                      -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        
        .neumorphic-inset {
          box-shadow: inset 6px 6px 12px rgba(163, 177, 198, 0.5),
                      inset -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
        
        .neumorphic-button {
          box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
                      -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
        
        .neumorphic-button:hover {
          box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
                      -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
        
        .neumorphic-button:active {
          box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.5),
                      inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
        
        .neumorphic-active {
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3),
                      8px 8px 16px rgba(163, 177, 198, 0.6),
                      -8px -8px 16px rgba(255, 255, 255, 0.8);
        }
        
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
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}