const API_BASE = "http://localhost:5000/api/results";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* ===============================
   Submit assessment answers
================================ */
export const submitResult = async ({ answers, timeSpent }) => {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answers, timeSpent }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to submit assessment");
  }

  return data;
};

/* ===============================
   Fetch logged-in student result
================================ */
export const fetchMyResult = async () => {
  const res = await fetch(`${API_BASE}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch result");
  }

  return data;
};
