export const generateAssessment = async ({ payload, syllabusFile }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const formData = new FormData();

  formData.append("payload", JSON.stringify(payload));

  if (syllabusFile) {
    formData.append("pdf", syllabusFile);
  }

  const res = await fetch(
    "http://localhost:5000/api/ai/generate-assessment",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await res.json();

  /* ===============================
     HANDLE KNOWN CASES
  ================================ */

  // ⚠️ Assessment already exists (EXPECTED)
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

/* ===============================
   ROLLBACK ASSESSMENT
================================ */
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
