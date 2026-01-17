import { useState, useEffect } from "react";
import { getMyInstitution } from "../../services/institutionApi";

import AdminSidebar from "./components/AdminSidebar";
import DashboardTab from "./components/DashboardTab";
import InstitutionTab from "./components/InstitutionTab";
import BatchTab from "./components/BatchTab";
import AssignTab from "./components/AssignTab";
import AiBuilderTab from "./components/AiBuilderTab";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    getMyInstitution().then((res) => setInstitution(res.institution));
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "institution":
        return (
          <InstitutionTab
            institution={institution}
            setInstitution={setInstitution}
          />
        );
      case "batch":
        return <BatchTab institution={institution} />;
      case "assign":
        return <AssignTab />;
      case "ai":
        return <AiBuilderTab institution={institution} />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="admin-main">
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;
