import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  FaCrown, 
  FaChartBar, 
  FaUsers, 
  FaUserPlus, 
  FaTrash,
  FaUserShield,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalStudents: 0,
    activeStudents: 0,
  });

  // Users list
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all"); // all, admin, student

  // Add user form
  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  // Get token
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Fetch profile and stats
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/superadmin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.name || "Super Admin");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/superadmin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalAdmins + data.totalStudents,
          totalAdmins: data.totalAdmins,
          totalStudents: data.totalStudents,
          activeStudents: data.activeStudents,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/superadmin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
      return toast.error("All fields are required");
    }

    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/superadmin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addUserForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${addUserForm.role} created successfully`);
        setAddUserForm({ name: "", email: "", password: "", role: "student" });
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/superadmin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (userFilter === "all") return true;
    return user.role === userFilter;
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-layout">
      {/* Sidebar */}
      <aside className="superadmin-sidebar">
        <h2 className="logo">
          <FaCrown /> SuperAdmin
        </h2>
        <nav>
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <MdDashboard /> Dashboard
          </button>
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers /> Manage Users
          </button>
          <button
            className={activeTab === "add-user" ? "active" : ""}
            onClick={() => setActiveTab("add-user")}
          >
            <FaUserPlus /> Add User
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="superadmin-main">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-header">
              <h1>
                <FaCrown /> Super Admin Dashboard
              </h1>
              {userName && (
                <p className="welcome-text">
                  Welcome back, <strong>{userName}</strong>!
                </p>
              )}
            </div>

            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <FaUserShield />
                </div>
                <div className="stat-content">
                  <h3>Total Admins</h3>
                  <p className="stat-number">{stats.totalAdmins}</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <FaUserGraduate />
                </div>
                <div className="stat-content">
                  <h3>Total Students</h3>
                  <p className="stat-number">{stats.totalStudents}</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-content">
                  <h3>Active Students</h3>
                  <p className="stat-number">{stats.activeStudents}</p>
                </div>
              </div>
            </div>

            <div className="features-section">
              <h2>System Features</h2>
              <ul className="dashboard-list">
                <li><FaUserPlus /> Create / Remove Admins & Students</li>
                <li><FaChartBar /> System Configuration</li>
                <li><FaChartBar /> Platform Analytics</li>
                <li><FaUserShield /> Security & Logs</li>
              </ul>
            </div>
          </>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <>
            <div className="dashboard-header">
              <h1><FaUsers /> Manage Users</h1>
              <p className="welcome-text">View and manage all system users</p>
            </div>

            <div className="filter-section">
              <button
                className={userFilter === "all" ? "filter-btn active" : "filter-btn"}
                onClick={() => setUserFilter("all")}
              >
                <FaUsers /> All Users ({users.length})
              </button>
              <button
                className={userFilter === "admin" ? "filter-btn active" : "filter-btn"}
                onClick={() => setUserFilter("admin")}
              >
                <FaUserShield /> Admins ({users.filter((u) => u.role === "admin").length})
              </button>
              <button
                className={userFilter === "student" ? "filter-btn active" : "filter-btn"}
                onClick={() => setUserFilter("student")}
              >
                <FaUserGraduate /> Students ({users.filter((u) => u.role === "student").length})
              </button>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === "admin" ? <FaUserShield /> : <FaUserGraduate />}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                          {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {user.role !== "superadmin" && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <p className="no-data">No users found</p>
              )}
            </div>
          </>
        )}

        {/* Add User Tab */}
        {activeTab === "add-user" && (
          <>
            <div className="dashboard-header">
              <h1><FaUserPlus /> Add New User</h1>
              <p className="welcome-text">Create admin or student accounts</p>
            </div>

            <form className="add-user-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={addUserForm.name}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={addUserForm.email}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={addUserForm.password}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={addUserForm.role}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, role: e.target.value })
                  }
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">
                <FaUserPlus /> Create User
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;