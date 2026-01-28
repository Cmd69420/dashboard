// frontend/api/license.js
import axios from "axios";
const API_BASE = "https://backup-server-q2dc.onrender.com";

export const getLmsUserId = async (email) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/payment/get-lms-user-id`,  // ✅ FIXED: Changed from /api/license to /api/payment
      { email },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.lms_user_id;
  } catch (error) {
    console.error('Error getting lms_user_id:', error);
    throw error;
  }
};