import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/common/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/student/StudentProfile";
import Results from "./pages/common/Results";
import Assessment from "./pages/common/Assessment";


/* ---------------- App Layout ---------------- */
const AppLayout = ({ children }) => {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideNavbar ? <Layout>{children}</Layout> : children}
    </>
  );
};

/* ---------------- App ---------------- */
function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* STUDENT PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student", "admin", "superadmin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ SINGLE ASSESSMENT PAGE */}
          <Route
            path="/assessment"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Assessment />
              </ProtectedRoute>
            }
          />

          {/* RESULTS */}
          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Results />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
