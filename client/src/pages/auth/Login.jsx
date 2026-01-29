import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import {
  FiEye, FiEyeOff, FiInfo, FiAlertTriangle,
  FiArrowLeft, FiArrowRight, FiMail, FiPhone, FiLock
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import {
  loginUser,
  googleLogin,
  updateRole,
  forgotPassword,
  resetPassword,
} from "../../services/authApi";
import "./Login.css";

const Login = () => {
  /* ---------------- STATE ---------------- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [remember, setRemember] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMethod, setForgotMethod] = useState("email"); // "email" or "whatsapp"
  const [forgotEmail, setForgotEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
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
    };
  };

  const strength = getPasswordStrength(password);
  const handleKeyEvent = (e) => setCapsOn(e.getModifierState("CapsLock"));

  const completeLogin = (userData, isRemember) => {
    login({ token: userData.token, role: userData.role, remember: isRemember });
    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password, role });
      if (res.success) completeLogin(res.data, remember);
      else toast.error(res.message || "Invalid credentials");
    } catch (err) { toast.error("Connection error"); }
    finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (cred) => {
    setLoading(true);
    try {
      const res = await googleLogin({ token: cred.credential });
      if (res.success) {
        if (res.data.role) completeLogin(res.data, true);
        else {
          setTempToken(res.data.token);
          setShowRoleModal(true);
        }
      } else toast.error(res.message || "Google login failed");
    } catch (err) { toast.error("Google login failed"); }
    finally { setLoading(false); }
  };

  const submitGoogleRole = async () => {
    if (!tempToken) return;
    setLoading(true);
    try {
      const res = await updateRole(tempToken, role);
      if (res.success) {
        completeLogin({ token: tempToken, role: res.role || res.data.role }, true);
        setShowRoleModal(false);
      } else toast.error(res.message || "Failed to update role");
    } catch (err) { toast.error("Error updating role"); }
    finally { setLoading(false); }
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      // Send only the selected method to the backend
      const payload = forgotMethod === "email"
        ? { email: forgotEmail }
        : { phone: phone, email: forgotEmail }; // Keeping email as secondary identifier if needed by your controller

      const res = await forgotPassword(payload);
      if (res.success) {
        toast.success(`OTP Sent to your ${forgotMethod}!`);
        setForgotStep(2);
      } else toast.error(res.message);
    } catch (err) { toast.error("Error sending OTP"); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await resetPassword({ email: forgotEmail, otp, newPassword });
      if (res.success) {
        toast.success("Password Updated!");
        setShowForgot(false);
        setForgotStep(1);
      } else toast.error(res.message);
    } catch (err) { toast.error("Reset failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="cprs-login-scope">
    <div className="auth-container">
      <div className="auth-visual-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-card-inner">
          <header className="auth-header">
            <h1 className="brand-title">CPRS<span> AI</span></h1>
            <p className="brand-subtitle">Login to your control panel</p>
          </header>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field">
                <FiMail className="field-icon" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                {password && (
                  <span className="strength-text" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                )}
              </div>
              <div className="input-field">
                <FiLock className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyEvent}
                  autoComplete="current-password"
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
            </div>

            {capsOn && (
              <div className="auth-alert warning">
                <FiAlertTriangle /> <span>Caps Lock is Active</span>
              </div>
            )}

            <div className="input-group">
              <label>Account Type</label>
              <select className="auth-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student Portal</option>
                <option value="admin">Administrator</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div className="auth-options">
              <label className="checkbox-container">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                <span className="checkmark"></span>
                <span className="label-text">Keep me logged in</span>
              </label>
              <button
                type="button"
                className="auth-link"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="loader"></span> : <>Sign In <FiArrowRight /></>}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="social-auth">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>

          <footer className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Create one for free</Link></p>
          </footer>
        </div>
      </div>

      {/* --- ROLE COMPLETION MODAL --- */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <h3>Finalize Profile</h3>
            <p>Please select your intended role to complete registration.</p>
            <select className="auth-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <button className="submit-btn" onClick={submitGoogleRole} disabled={loading}>
              {loading ? "Finalizing..." : "Complete Setup"}
            </button>
          </div>
        </div>
      )}

      {/* --- DYNAMIC FORGOT PASSWORD MODAL --- */}
      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-content glass-effect">
            <header className="modal-header">
              <h3>Account Recovery</h3>
              <button className="close-btn" onClick={() => setShowForgot(false)}>&times;</button>
            </header>

            {forgotStep === 1 ? (
              <div className="modal-body">
                <div className="tab-switcher">
                  <button
                    className={forgotMethod === "email" ? "active" : ""}
                    onClick={() => setForgotMethod("email")}
                  >
                    <FiMail /> Email
                  </button>
                  <button
                    className={forgotMethod === "whatsapp" ? "active" : ""}
                    onClick={() => setForgotMethod("whatsapp")}
                  >
                    <FiPhone /> WhatsApp
                  </button>
                </div>

                <p className="modal-hint">
                  {forgotMethod === "email"
                    ? "Enter your email to receive a secure OTP code."
                    : "Enter your phone number linked to WhatsApp."}
                </p>

                {/* Logic updated to show ONLY one field based on selection */}
                {forgotMethod === "email" ? (
                  <div className="input-field">
                    <FiMail className="field-icon" />
                    <input
                      placeholder="Email Address"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="input-field">
                    <FiPhone className="field-icon" />
                    <input
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button className="submit-btn" onClick={handleRequestOTP} disabled={loading}>
                  Request OTP
                </button>
              </div>
            ) : (
              <div className="modal-body">
                <p className="modal-hint">A 6-digit code was sent to your {forgotMethod}.</p>
                <div className="input-field">
                  <input className="otp-input" placeholder="0 0 0 0 0 0" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
                </div>
                <div className="input-field">
                  <FiLock className="field-icon" />
                  <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <button className="submit-btn" onClick={handleResetPassword} disabled={loading}>Update Credentials</button>
                <button className="back-link" onClick={() => setForgotStep(1)}>
                  <FiArrowLeft /> Try another method
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Login;