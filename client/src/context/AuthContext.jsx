import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check both storages for the token
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        logout(); // Clear corrupted data
      }
    }
    setLoading(false);
  }, []);

  /**
   * login function
   * @param {string} token - JWT token from server
   * @param {string} role - User role (student/admin/etc)
   * @param {boolean} remember - Whether to use localStorage or sessionStorage
   */
  const login = ({ token, role, remember }) => {
    // Remove quotes if present in the token string
    const cleanToken = token.replace(/^"|"$/g, "");
    const userData = { role }; // You can expand this object if the backend sends name/email

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("token", cleanToken);
    storage.setItem("user", JSON.stringify(userData));
    
    // We also keep a loose role item for quick access if needed by other legacy services
    storage.setItem("role", role);

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);