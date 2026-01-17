import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import {
  fetchStudentBatchStatus,
  fetchAvailableBatches,
  joinBatch,
} from "../../services/studentApi";
import {
  fetchInstitutions,
  selectInstitution,
} from "../../services/institutionApi";
import { toast } from "react-toastify";
import "./StudentDashboard.css";


const StudentDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [userName, setUserName] = useState(""); // ✅ NEW: Store username
  const [institutions, setInstitutions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [joining, setJoining] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchStudentBatchStatus();
      setStatus(res);
      
      // ✅ NEW: Set username from API response
      if (res.userName) {
        setUserName(res.userName);
      }

      if (res.profileComplete && !res.institutionId) {
        const instRes = await fetchInstitutions();
        setInstitutions(instRes.institutions || []);
        setBatches([]);
        return;
      }

      if (res.profileComplete && res.institutionId && !res.assigned) {
        const batchRes = await fetchAvailableBatches();
        setBatches(batchRes.batches || []);
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleInstitutionSelect = async (id) => {
    try {
      setSelecting(true);
      await selectInstitution(id);
      toast.success("Institution selected");
      await loadDashboard();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSelecting(false);
    }
  };

  const handleJoinBatch = async (batchId) => {
    try {
      setJoining(true);
      await joinBatch(batchId);
      toast.success("Joined batch successfully");
      await loadDashboard();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        {/* ✅ NEW: Display username with greeting */}
        <div className="dashboard-header">
          <h1>Student Dashboard 🎓</h1>
          {userName && (
            <p className="welcome-text">Welcome back, <strong>{userName}</strong>!</p>
          )}
        </div>

        {!status?.profileComplete && (
          <div className="warning-card">
            <h3>Complete Your Profile</h3>
            <button onClick={() => navigate("/profile")}>
              Complete Profile
            </button>
          </div>
        )}

        {status?.profileComplete && !status?.institutionId && (
          <div className="institution-section">
            <h3>Select Your Institution</h3>
            {institutions.map((inst) => (
              <div key={inst._id} className="institution-card">
                <p>{inst.name}</p>
                <button
                  disabled={selecting}
                  onClick={() => handleInstitutionSelect(inst._id)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}

        {status?.profileComplete &&
          status?.institutionId &&
          !status?.assigned && (
            <div className="batch-section">
              <h3>Available Batches</h3>
              {batches.map((b) => (
                <div key={b.batchId} className="batch-card">
                  <p><strong>{b.name}</strong></p>
                  <p>{b.slot.date}</p>
                  <p>{b.slot.startTime} - {b.slot.endTime}</p>
                  <button
                    disabled={joining}
                    onClick={() => handleJoinBatch(b.batchId)}
                  >
                    Join Batch
                  </button>
                </div>
              ))}
            </div>
          )}

        {status?.assigned && (
          <div className="batch-card highlight">
            <h3>Your Assigned Batch</h3>
            <p><strong>Batch ID:</strong> {status.batchId}</p>
            <button
              className="primary-btn"
              onClick={() => navigate("/assessment")}
            >
              Start Assessment
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;