const API_BASE = "http://localhost:5000/api";

export const testServer = async () => {
  const res = await fetch(`${API_BASE}/assessment/test`);
  return res.json();
};
