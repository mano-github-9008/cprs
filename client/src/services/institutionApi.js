const API_BASE = "http://localhost:5000/api/institution";

/* ===============================
   Auth token helper
================================ */
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

/* =====================================================
   STUDENT – Fetch active institutions
   GET /api/institution/list
===================================================== */
export const fetchInstitutions = async () => {
  const res = await fetch(`${API_BASE}/list`);

  if (!res.ok) {
    throw new Error("Failed to fetch institutions");
  }

  return res.json();
};

/* =====================================================
   STUDENT – Select institution
   POST /api/student/select-institution
===================================================== */
export const selectInstitution = async (institutionId) => {
  const res = await fetch(
    "http://localhost:5000/api/student/select-institution",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ institutionId }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to select institution");
  }

  return res.json();
};

/* =====================================================
   ADMIN – Create institution
   POST /api/institution/create
===================================================== */
export const createInstitution = async (payload) => {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create institution");
  }

  return res.json();
};

/* =====================================================
   ADMIN – Get logged-in admin institution
   GET /api/institution/my
===================================================== */
export const getMyInstitution = async () => {
  const res = await fetch(`${API_BASE}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch institution");
  }

  return res.json();
};
