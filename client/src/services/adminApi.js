const API_BASE = "http://localhost:5000/api/admin";

/* ===============================
   Auth token helper
================================ */
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* ===============================
   Fetch admin dashboard stats
================================ */
export const fetchAdminStats = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const res = await fetch(`${API_BASE}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch admin stats");
  }

  return res.json();
};
