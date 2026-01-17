import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role });
    }
    setLoading(false);
  }, []);

  const login = ({ token, role, remember }) => {
    const cleanToken = token.replace(/^"|"$/g, "");

    if (remember) {
      localStorage.setItem("token", cleanToken);
    } else {
      sessionStorage.setItem("token", cleanToken);
    }

    localStorage.setItem("role", role);
    setUser({ role });
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
