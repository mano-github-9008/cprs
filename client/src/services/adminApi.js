const API_BASE = "http://localhost:5000/api/admin";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const authorizedFetch = async (endpoint) => {
  const token = getToken();
  if (!token) throw new Error("No auth token found");

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error at ${endpoint}:`, err.message);
    throw err;
  }
};

export const fetchAdminStats = () => authorizedFetch("/stats");
export const fetchRecentActivities = () => authorizedFetch("/activity");