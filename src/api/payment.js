// frontend/api/payment.js
import axios from "axios";

const LICENSE_API = "https://lisence-system.onrender.com";

/**
 * Step 1: Purchase License - Creates the license purchase and pending transaction
 * This must be called BEFORE creating the Razorpay order
 */
export const purchaseLicense = async ({ 
  name,           // User's full name
  email,          // User's email
  orgName = "",   // Organization name (optional)
  licenseId,      // License type ID
  billingCycle,   // monthly/quarterly/yearly
  source = "Geotrack",  // Product name
  amount,         // Total amount in paise
  currency = "INR"
}) => {
  try {
    const payload = {
      name,
      email,
      orgName,
      licenseId,
      billingCycle,
      source,
      amount,
      currency
    };
    
    console.log("📤 Purchasing license with LMS payload:");
    console.log("   name:", name);
    console.log("   email:", email);
    console.log("   orgName:", orgName);
    console.log("   licenseId:", licenseId);
    console.log("   billingCycle:", billingCycle);
    console.log("   source:", source);
    console.log("   amount:", amount);
    console.log("   currency:", currency);
    console.log("   Full payload:", JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${LICENSE_API}/api/lms/purchase-license`,
      payload
    );

    console.log("✅ License purchased:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ Error purchasing license:");
    console.error("   Status:", error.response?.status);
    console.error("   Data:", error.response?.data);
    console.error("   Full error:", error);
    throw error;
  }
};

/**
 * Step 2: Create Razorpay order
 * This uses the pending transaction created in step 1 (purchaseLicense)
 */
export const createOrder = async ({ userId, licenseId, billingCycle, amount }) => {
  try {
    console.log("📤 Creating Razorpay order:", { userId, licenseId, billingCycle, amount });
    
    const response = await axios.post(
      `${LICENSE_API}/api/payment/create-order`,
      {
        userId,
        licenseId,
        billingCycle,
        amount,
      }
    );

    console.log("✅ Razorpay order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating order:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Step 3: Verify payment after user completes Razorpay checkout
 */
export const verifyPayment = async (paymentData) => {
  try {
    console.log("📤 Verifying payment:", paymentData);
    
    const response = await axios.post(
      `${LICENSE_API}/api/payment/verify`,
      paymentData
    );

    console.log("✅ Payment verified:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    throw error;
  }
};

/**
 * Initialize Razorpay script
 */
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};