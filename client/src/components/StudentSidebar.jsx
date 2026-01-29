import { Link, useLocation } from "react-router-dom";
import "./StudentSidebar.css";

const StudentSidebar = () => {
  const location = useLocation();
  const isAssessmentActive = location.pathname.startsWith("/assessment");

  return (
    <aside className="student-sidebar" role="navigation">
      <div className="sidebar-header">
        <h2>CareerPath AI</h2>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/assessment"
          className={isAssessmentActive ? "active" : ""}
        >
          Assessment
        </Link>

        <Link
          to="/results"
          className={location.pathname === "/results" ? "active" : ""}
        >
          Results
        </Link>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
