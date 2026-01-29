import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye, FiEyeOff, FiAlertTriangle,
  FiArrowRight, FiMail, FiLock, FiUser
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { signupUser, googleLogin, updateRole } from "../../services/authApi";
import "./Signup.css";

const Signup = () => {
  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Google Role Completion States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempToken, setTempToken] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  /* ---------------- LOGIC ---------------- */
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return {
      label: score <= 1 ? "Weak" : score === 2 ? "Medium" : "Strong",
      color: score <= 1 ? "#ef4444" : score === 2 ? "#f59e0b" : "#10b981",
      width: score === 0 ? "0%" : score <= 1 ? "33%" : score === 2 ? "66%" : "100%"
    };
  };

  const strength = getPasswordStrength(form.password);
  const handleKeyEvent = (e) => setCapsOn(e.getModifierState("CapsLock"));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const completeSignup = (userData) => {
    login({ token: userData.token, role: userData.role });
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signupUser(form);
      if (res.success) completeSignup(res.data);
      else toast.error(res.message || "Registration failed");
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setLoading(true);
    try {
      const res = await googleLogin({ token: cred.credential });
      if (res.success) {
        if (res.data.role) completeSignup(res.data);
        else {
          setTempToken(res.data.token);
          setShowRoleModal(true);
        }
      } else toast.error(res.message || "Google signup failed");
    } catch (err) { toast.error("Google signup failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="cprs-signup-scope">
      <div className="auth-container">
        <div className="auth-visual-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div className="auth-card">
          <div className="auth-card-inner">
            <header className="auth-header">
              <h1 className="brand-title">CPRS<span> AI</span></h1>
              <p className="brand-subtitle">Join the next generation of control</p>
            </header>

            <form onSubmit={handleSignup} className="auth-form">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field">
                  <FiUser className="field-icon" />
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <div className="input-field">
                  <FiMail className="field-icon" />
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label>Create Password</label>
                  {form.password && (
                    <span className="strength-text" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="input-field">
                  <FiLock className="field-icon" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    onKeyUp={handleKeyEvent}
                    required
                  />
                  <button
                    type="button"
                    className="visibility-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                
                <div className="strength-bar-container">
                   <div 
                    className="strength-bar" 
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  ></div>
                </div>
              </div>

              {capsOn && (
                <div className="auth-alert warning">
                  <FiAlertTriangle /> <span>Caps Lock is Active</span>
                </div>
              )}

              <div className="input-group">
                <label>Account Type</label>
                <select className="auth-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student Portal</option>
                  <option value="admin">Administrator</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="loader"></span> : <>Create Account <FiArrowRight /></>}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or join with</span>
            </div>

            <div className="social-auth">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                theme="filled_blue"
                shape="pill"
                text="signup_with"
                width="100%"
              />
            </div>

            <footer className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </footer>
          </div>
        </div>

        {/* --- ROLE COMPLETION MODAL --- */}
        {showRoleModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-effect">
              <h3>Complete Registration</h3>
              <p>Select your role to finish setting up your account.</p>
              <select className="auth-select" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <button className="submit-btn" onClick={() => {/* Logic to updateRole */}} disabled={loading}>
                {loading ? "Finalizing..." : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;