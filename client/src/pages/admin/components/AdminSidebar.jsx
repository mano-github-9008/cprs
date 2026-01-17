import {
    FiHome,
    FiBook,
    FiLayers,
    FiUserPlus,
    FiCpu,
  } from "react-icons/fi";
  import "./AdminSidebar.css";
  
  const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const tabs = [
      { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
      { id: "institution", label: "Institution", icon: <FiBook /> },
      { id: "batch", label: "Batch & Slots", icon: <FiLayers /> },
      { id: "assign", label: "Assign Students", icon: <FiUserPlus /> },
      { id: "ai", label: "AI Builder", icon: <FiCpu /> },
    ];
  
    return (
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CareerPath AI</span>
        </div>
  
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-btn ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="icon">{tab.icon}</span>
              <span className="label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    );
  };
  
  export default AdminSidebar;
  