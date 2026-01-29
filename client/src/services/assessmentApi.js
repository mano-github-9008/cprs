const BASE_URL = "http://localhost:5000/api/ai";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* ===============================
   Generate AI Assessment (ADMIN)
================================ */
export const generateAssessment = async (payload) => {
  const formData = new FormData();

  // payload fields
  Object.keys(payload).forEach((key) => {
    if (key !== "pdf") {
      formData.append(key, JSON.stringify(payload[key]));
    }
  });

  // optional PDF
  if (payload.pdf) {
    formData.append("pdf", payload.pdf);
  }

  const res = await fetch(`${BASE_URL}/generate-assessment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to generate assessment");
  }

  return res.json();
};
