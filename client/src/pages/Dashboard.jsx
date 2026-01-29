import { useAuth } from "../context/AuthContext";

import StudentDashboard from "./student/StudentDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "student") return <StudentDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "superadmin") return <SuperAdminDashboard />;

  return <h2>Unauthorized</h2>;
};

export default Dashboard;
