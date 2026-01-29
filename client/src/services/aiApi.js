/**
 * GENERATE AI ASSESSMENT
 * @param {FormData} formData - Accepts the direct FormData object from the UI
 */
export const generateAssessment = async (formData) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // NOTE: We don't need to append manually here because 
  // the AiBuilderTab.jsx is already passing a fully formed FormData object.
  // However, we ensure the backend 'pdf' field matches what multer expects.

  const res = await fetch(
    "http://localhost:5000/api/ai/generate-assessment",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Do NOT set 'Content-Type' header when sending FormData
        // Fetch will automatically set it with the correct boundary
      },
      body: formData,
    }
  );

  const data = await res.json();

  /* ===============================
      HANDLE KNOWN CASES
  ================================ */

  // ⚠️ Assessment already exists (Conflict)
  if (res.status === 409) {
    throw new Error(
      "Assessment already exists for this batch. Please delete it before regenerating."
    );
  }

  // ❌ Other errors
  if (!res.ok) {
    throw new Error(data.message || "Assessment generation failed");
  }

  return data;
};

/**
 * ROLLBACK ASSESSMENT
 * @param {string} id - The MongoDB ID of the assessment
 */
export const rollbackAssessment = async (id) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const res = await fetch(
    `http://localhost:5000/api/ai/rollback/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Rollback failed");
  }

  return data;
};