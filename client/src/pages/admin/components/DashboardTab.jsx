import { useEffect, useState } from "react";
import { fetchAdminStats } from "../../../services/adminApi";
import "./DashboardTab.css";

const DashboardTab = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    adminName: "",
  });

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  return (
    <>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        {stats.adminName && (
          <header className="admin-header">
            <div className="welcome-container">
              <div className="status-badge">
                <span className="dot"></span>
                System Active
              </div>
              <h1 className="welcome-text">
                Welcome back, <span className="admin-name">{stats.adminName}</span>
              </h1>
            </div>
            <div className="header-date">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </header>
        )}
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="stat-card highlight">
          <h3>Active Students</h3>
          <p>{stats.activeStudents}</p>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;