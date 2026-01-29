const API_URL = "http://localhost:5000/api/auth";

/**
 * HELPER: Processes the fetch response to ensure consistency.
 * It extracts JSON and throws an error if the response status is not OK.
 */
const handleResponse = async (res) => {
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Operation failed");
  }
  return result; // This returns the actual JSON from your backend
};

/* ================= SIGNUP ================= */
export const signupUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);
    // Returning success: true and the data (which contains token/role)
    return { success: true, message: result.message, data: result };
  } catch (error) {
    return { success: false, message: error.message || "Server not reachable" };
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);
    return { success: true, message: result.message, data: result };
  } catch (error) {
    return { success: false, message: error.message || "Server not reachable" };
  }
};

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = async (data) => {
  try {
    const res = await fetch(`${API_URL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);
    return { success: true, message: result.message, data: result };
  } catch (error) {
    return { success: false, message: error.message || "Server not reachable" };
  }
};

/* ================= UPDATE ROLE ================= */
/**
 * FIXED: This sends the Bearer token to the 'protect' middleware 
 * and handles the 'success' flag for the role selection modal.
 */
export const updateRole = async (token, role) => {
  try {
    const res = await fetch(`${API_URL}/update-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const result = await handleResponse(res);
    
    //result will contain { success: true, role: "...", message: "..." }
    return { 
      success: true, 
      message: result.message, 
      data: result, // result.role will be here
      role: result.role // Shortcut for easier access in Login.jsx
    };
  } catch (error) {
    console.error("API Error Detail:", error.message);
    return { success: false, message: error.message || "Role update failed" };
  }
};

/* ================= FORGOT PASSWORD (OTP) ================= */
export const forgotPassword = async (data) => {
  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);
    return { success: true, message: result.message };
  } catch (error) {
    console.error("API Error Detail:", error.message);
    return { success: false, message: error.message };
  }
};

/* ================= RESET PASSWORD (VERIFY) ================= */
export const resetPassword = async (data) => {
  try {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await handleResponse(res);
    return { success: true, message: result.message };
  } catch (error) {
    console.error("API Error Detail:", error.message);
    return { success: false, message: error.message };
  }
};