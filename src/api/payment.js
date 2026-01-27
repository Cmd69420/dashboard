import axios from "axios";

const API_BASE = "https://backup-server-q2dc.onrender.com";
const LICENSE_API_BASE = "https://lisence-system.onrender.com";

// Axios instance with auth interceptor
const API = axios.create({
  baseURL: LICENSE_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Payment API functions
export const createOrder = async ({
  userId,
  licenseId,
  billingCycle,
  amount,
  orderType, // 'plan', 'slot-expansion', 'renewal'
  orderDetails,
}) => {
  const res = await API.post("/api/payment/create-order", {
    userId,
    licenseId,
    billingCycle,
    amount,
    orderType,
    orderDetails,
  });
  return res.data;
};

// Verify payment after Razorpay returns handler response
export const verifyPayment = async (details) => {
  const res = await API.post("/api/payment/verify-payment", details);
  return res.data;
};

export const getTransactionDetails = async (transactionId) => {
  const res = await API.get(`/api/payment/transaction/${transactionId}`);
  return res.data;
};

export const downloadInvoice = (transactionId) => {
  if (!transactionId) return;
  window.open(
    `${LICENSE_API_BASE}/api/payment/invoice/${transactionId}`,
    "_blank"
  );
};

// Initialize Razorpay payment
export const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default API;