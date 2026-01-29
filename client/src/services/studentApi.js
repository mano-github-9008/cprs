const API_BASE = "http://localhost:5000/api/student";

/* ==================================================
   AUTH TOKEN HELPER
================================================== */
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

/* ==================================================
   COMMON FETCH HANDLER
================================================== */
const apiFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token missing. Please login again.");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        data?.message || "Session expired. Please login again."
      );
    }

    throw new Error(data?.message || "Request failed");
  }

  return data;
};

/* ==================================================
   BATCH + DASHBOARD STATUS
================================================== */
export const fetchStudentBatchStatus = async () => {
  return apiFetch(`${API_BASE}/batch-status`, {
    method: "GET",
  });
};

/* ==================================================
   SAVE / UPDATE STUDENT PROFILE
================================================== */
export const saveStudentProfile = async (profileData) => {
  return apiFetch(`${API_BASE}/profile`, {
    method: "POST",
    body: JSON.stringify(profileData),
  });
};

/* ==================================================
   SELECT INSTITUTION
================================================== */
export const selectInstitution = async (institutionId) => {
  return apiFetch(`${API_BASE}/select-institution`, {
    method: "POST",
    body: JSON.stringify({ institutionId }),
  });
};

/* ==================================================
   AVAILABLE BATCHES
================================================== */
export const fetchAvailableBatches = async () => {
  return apiFetch(`${API_BASE}/available-batches`, {
    method: "GET",
  });
};

/* ==================================================
   JOIN BATCH
================================================== */
export const joinBatch = async (batchId) => {
  return apiFetch(`${API_BASE}/join-batch`, {
    method: "POST",
    body: JSON.stringify({ batchId }),
  });
};

/* ==================================================
   FETCH ASSESSMENT
================================================== */
export const fetchAssessment = async () => {
  try {
    return await apiFetch(`${API_BASE}/assessment`, {
      method: "GET",
    });
  } catch (err) {
    return {
      locked: true,
      reason: err.message,
      slot: null,
    };
  }
};
