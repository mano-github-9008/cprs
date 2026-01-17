import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Read auth data
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role"); // student | admin | superadmin

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">CareerPath AI</Link>
      </div>

      <ul className="nav-links">
        {/* GUEST */}
        {!token && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}

        {/* STUDENT */}
        {token && role === "student" && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/assessment">Assessment</Link></li>
            <li>
              <Link
                to="#"
                className="nav-item logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </Link>
            </li>
          </>
        )}

        {/* ADMIN */}
        {token && role === "admin" && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/admin">Admin Panel</Link></li>
            <li>
              <Link
                to="#"
                className="nav-item logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </Link>
            </li>
          </>
        )}

        {/* SUPER ADMIN */}
        {token && role === "superadmin" && (
          <>
            <li><Link className="nav-item" to="/dashboard">Dashboard</Link></li>
            <li><Link className="nav-item" to="/admin">Admin Panel</Link></li>
            <li>
              <Link
                to="#"
                className="nav-item logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </Link>
            </li>

          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
