import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminStats, fetchRecentActivities } from "../../../services/adminApi";
import "./DashboardTab.css";

const DashboardTab = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, activeStudents: 0, adminName: "" });
  const [activities, setActivities] = useState([]);
  const [dbStatus, setDbStatus] = useState("Connecting...");

  const syncDashboard = useCallback(async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        fetchAdminStats(),
        fetchRecentActivities(),
      ]);
      setStats(statsData);
      setActivities(activityData);
      setDbStatus("Connected");
    } catch (err) {
      console.error("Sync error:", err);
      setDbStatus("Disconnected");
    }
  }, []);

  useEffect(() => {
    syncDashboard();
    const interval = setInterval(syncDashboard, 10000); 
    return () => clearInterval(interval);
  }, [syncDashboard]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="dashboard-container">
      <header className="admin-header">
        <div className="welcome-container">
          <div className="status-badge">
            <span className={`dot ${dbStatus === "Connected" ? "pulse" : "error"}`}></span>
            Database {dbStatus}
          </div>
          <h1 className="welcome-text">
            {greeting}, <span className="admin-name">{stats.adminName}</span>
          </h1>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => navigate("/admin/students")}>+ Add Student</button>
        <button className="action-btn" onClick={() => navigate("/admin/assessments")}>Create Assessment</button>
        <button className="action-btn" onClick={() => navigate("/admin/reports")}>Reports</button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="db-value">{stats.totalStudents.toLocaleString()}</p>
        </div>
        <div className="stat-card highlight">
          <h3>Active Students</h3>
          <p className="db-value">{stats.activeStudents.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Inactive</h3>
          <p className="db-value">{(stats.totalStudents - stats.activeStudents).toLocaleString()}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel system-panel">
          <h3>System Health</h3>
          <ul className="health-list">
            <li><span className="check">✔</span> Server: Online</li>
            <li><span className="check">✔</span> API: Stable</li>
            <li><span className="check">✔</span> Auth: Verified</li>
          </ul>
        </div>

        <div className="panel activity-feed">
          <h3>Live Activity <span className="live-dot-icon">●</span></h3>
          <ul className="activity-list">
            {activities.length > 0 ? (
              activities.map((item) => (
                <li key={item.id || item._id} className="activity-item animate-in">
                  <div className="activity-text">
                    <span>{item.text}</span>
                    <small>{new Date(item.time).toLocaleTimeString()}</small>
                  </div>
                </li>
              ))
            ) : (
              <li className="empty-msg">No recent activity found</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;