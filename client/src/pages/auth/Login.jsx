import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../../context/AuthContext";
import { loginUser, googleLogin, updateRole } from "../../services/authApi";
import "./Login.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [remember, setRemember] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔐 EMAIL / PASSWORD LOGIN
  const handleLogin = async () => {
    const res = await loginUser({ email, password, role });

    if (!res.token) {
      alert(res.message);
      return;
    }

    login({
      token: res.token,
      role: res.role,
      remember,
    });

    navigate("/dashboard");
  };

  // 🔐 GOOGLE LOGIN
  const handleGoogleLogin = async (cred) => {
    const res = await googleLogin({
      token: cred.credential,
    });

    if (!res.token) {
      alert("Google login failed");
      return;
    }

    // Role already exists
    if (res.role) {
      login({
        token: res.token,
        role: res.role,
        remember: true,
      });
      navigate("/dashboard");
    } 
    // Role missing → ask user
    else {
      setTempToken(res.token);
      setShowRoleModal(true);
    }
  };

  // 🔐 SUBMIT ROLE AFTER GOOGLE LOGIN
  const submitRole = async () => {
    const res = await updateRole(tempToken, role);

    login({
      token: tempToken,
      role: res.role,
      remember: true,
    });

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Login to continue</p>

        {/* EMAIL */}
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* REMEMBER */}
        <div className="login-row">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Remember me
          </label>
        </div>

        {/* ROLE (EMAIL LOGIN ONLY) */}
        <select
          className="login-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>

        {/* LOGIN BUTTON */}
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* GOOGLE LOGIN */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => alert("Google Login Failed")}
        />

        {/* SIGNUP LINK */}
        <p className="signup-link">
          Don’t have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </div>

      {/* ROLE MODAL (GOOGLE USERS) */}
      {showRoleModal && (
        <div className="role-modal-backdrop">
          <div className="role-modal">
            <h3>Select Your Role</h3>
            <p>Please choose how you want to use the platform</p>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>

            <button onClick={submitRole}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
