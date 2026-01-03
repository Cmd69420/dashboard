import { useEffect, useState } from "react";

const PRODUCT_ID = "69589d3ba7306459dd47fd87";

export default function BillingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLicense, setActiveLicense] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [renewType, setRenewType] = useState("manual");

  // const activeTypeId = activeLicense?.licenseTypeId?._id?.toString();

const email = localStorage.getItem("userEmail");

  /* ================= FETCH PLANS ================= */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(
          `https://lisence-system.onrender.com/api/license/licenses-by-product/${PRODUCT_ID}`
        );
        const data = await res.json();

        // 🔥 TRANSFORM HERE
        const transformedPlans = (data?.licenses || []).map((plan) => ({
          ...plan,
          licenseType: plan.licenseTypeId, // 👈 alias
        }));

        setPlans(transformedPlans);
      } catch (err) {
        console.error("Failed to load plans", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /* ================= FETCH ACTIVE LICENSE ================= */

useEffect(() => {
  if (!email) {
    console.warn("No email found in localStorage");
    return;
  }

  const fetchActive = async () => {
    try {
      const url = `https://lisence-system.onrender.com/api/external/actve-license/${email}?productId=${PRODUCT_ID}`;
      console.log("Fetching active license:", url);

      const res = await fetch(url);
      const data = await res.json();

      console.log("ACTIVE LICENSE RESPONSE:", data);

      if (data?.success && data.activeLicense) {
        setActiveLicense(data.activeLicense);
      } else {
        setActiveLicense(null);
      }
    } catch (err) {
      console.error("Active license fetch failed", err);
      setActiveLicense(null);
    }
  };

  fetchActive();
}, [email]);

  /* ================= HELPERS ================= */

  // const getPlanTypeId = (plan) =>
  //   String(plan?.licenseTypeId?._id || "");

  // const getActiveTypeId = () =>
  //   String(activeLicense?.licenseTypeId?._id || "");

//   const isCurrentPlan = (plan) =>
//     getPlanTypeId(plan) === getActiveTypeId();

const isCurrentPlan = (plan) => {
  if (!activeLicense?.licenseTypeId?._id) return false;
  if (!plan?.licenseType?._id) return false;

  return (
    String(activeLicense.licenseTypeId._id) ===
    String(plan.licenseType._id)
  );
};

const openModal = (plan) => {
  const isRenew =
    String(plan.licenseType?._id) ===
    String(activeLicense?.licenseTypeId?._id);

  setSelectedPlan({
    licenseTypeId: plan.licenseType._id,
    name: plan.licenseType?.name,
    price: plan.licenseType?.price?.amount,
    isRenew,
  });

  setRenewType("manual");
  setShowModal(true);
};

const handleProceed = () => {
  console.log("Proceed payload:", {
    licenseTypeId: selectedPlan.licenseTypeId,
    renewType,
    isRenew: selectedPlan.isRenew,
    price: selectedPlan.price,
  });

  setShowModal(false);
};


  if (loading) return <div className="p-6">Loading plans...</div>;


  // ===== DEBUG LOGS =====

console.log("ACTIVE LICENSE RAW:", activeLicense);

plans.forEach((p, i) => {
  console.log(
    "PLAN", i,
    "TYPE ID:",
    p.licenseTypeId?._id,
    "== ACTIVE?",
    p.licenseTypeId?._id === activeLicense?.licenseTypeId?._id
  );
});



  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Pricing Plans</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const type = plan.licenseTypeId || {};
          const active = isCurrentPlan(plan);

          return (
            <div
              key={plan._id}
              className="rounded-2xl p-5 bg-[#ecf0f3] relative"
              style={{
                boxShadow: active
                  ? "inset 6px 6px 12px #c5c8cf, inset -6px -6px 12px #ffffff"
                  : "8px 8px 16px #c5c8cf, -8px -8px 16px #ffffff",
              }}
            >
              {/* ACTIVE BADGE */}
             {active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 
                    bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                    ✓ Active Plan
                </div>
                )}


              <h3 className="text-lg font-semibold mb-1">{type.name}</h3>

              <p className="text-sm text-gray-600 mb-2">
                {type.description || "No description available"}
              </p>

              <div className="text-2xl font-bold mb-1">
                ₹{type.price?.amount ?? 0}
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {type.price?.billingPeriod || "monthly"}
              </p>

              {Array.isArray(type.features) && (
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {type.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              )}

              {plan.maxLimits && (
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div>Users: {plan.maxLimits.users}</div>
                  <div>Storage: {plan.maxLimits.storageGB} GB</div>
                  <div>API Calls: {plan.maxLimits.apiCalls}</div>
                </div>
              )}

              {active && activeLicense?.endDate && (
                <p className="text-xs text-green-700 mb-3">
                  Renews on{" "}
                  <strong>
                    {new Date(activeLicense.endDate).toLocaleDateString()}
                  </strong>
                </p>
              )}

              {/* {active ? (
                <button
                  onClick={() => openModal(plan)}
                  className="w-full py-2 rounded-xl font-semibold bg-green-100 text-green-700"
                >
                  Renew / Manage
                </button>
              ) : (
                <button
                  onClick={() => openModal(plan)}
                  className="w-full py-2 rounded-xl text-white font-medium"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea, #764ba2)",
                  }}
                >
                  Select Plan
                </button>
              )} */}


              {active ? (
                <button
                    disabled
                    className="w-full py-2 rounded-xl font-semibold bg-green-200 text-green-800 cursor-not-allowed"
                >
                    Current Plan
                </button>
                ) : (
                <button
                    onClick={() => openModal(plan)}
                    className="w-full py-2 rounded-xl text-white font-medium"
                    style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    }}
                >
                    Select Plan
                </button>
                )}

            </div>
          );
        })}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedPlan?.isRenew
                      ? "Renew Subscription"
                      : "Upgrade Plan"}
                  </h3>
                  <p className="text-sm opacity-90">
                    {selectedPlan?.name}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)}>✕</button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4">
              <div className="relative bg-gray-100 rounded-xl p-1 flex">
                <div
                  className={`absolute top-1 left-1 h-[42px] w-1/2 rounded-lg bg-indigo-600 transition-all ${
                    renewType === "auto" ? "translate-x-full" : ""
                  }`}
                />

                <button
                  className={`relative z-10 flex-1 h-10 font-semibold ${
                    renewType === "manual"
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                  onClick={() => setRenewType("manual")}
                >
                  Renew Manually
                </button>

                <button
                  className={`relative z-10 flex-1 h-10 font-semibold ${
                    renewType === "auto"
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                  onClick={() => setRenewType("auto")}
                >
                  Auto Renew
                </button>
              </div>

              <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
                {renewType === "manual" ? (
                  <>
                    You will manually renew this subscription when it expires.
                    <div className="text-gray-500 mt-1">
                      No automatic charges.
                    </div>
                  </>
                ) : (
                  <>
                    Subscription will renew automatically before expiry.
                    <div className="text-gray-500 mt-1">
                      You can disable auto-renew anytime.
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleProceed}
                className="px-8 py-2 rounded-xl bg-purple-600 text-white font-semibold"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}