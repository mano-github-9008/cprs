const BASE = "http://localhost:5000/api/admin/batch";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const fetchBatches = async () => {
  const res = await fetch(`${BASE}/all`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const createBatch = async (data) => {
  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const addStudentToBatch = async (data) => {
  const res = await fetch(`${BASE}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
