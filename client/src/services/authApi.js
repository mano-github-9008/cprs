const API_URL = "http://localhost:5000/api/auth";

/* ================= SIGNUP ================= */
export const signupUser = async (data) => {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

/* ================= LOGIN ================= */
export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = async (data) => {
  const res = await fetch(`${API_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

/* ================= UPDATE ROLE ================= */
export const updateRole = async (token, role) => {
  const res = await fetch(`${API_URL}/update-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  return res.json();
};
