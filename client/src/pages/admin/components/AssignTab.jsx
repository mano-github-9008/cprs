import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchBatches, addStudentToBatch } from "../../../services/batchApi";
import "./AssignTab.css";

const AssignTab = () => {
  const [batches, setBatches] = useState([]);
  const [assignForm, setAssignForm] = useState({ batchId: "", studentEmail: "" });

  useEffect(() => {
    fetchBatches().then((res) => setBatches(res.batches || []));
  }, []);

  const handleAssignStudent = async () => {
    if (!assignForm.batchId || !assignForm.studentEmail) {
      return toast.error("Batch & student email required");
    }
    const res = await addStudentToBatch(assignForm);
    toast.success(res.message || "Student assigned successfully");
    setAssignForm({ ...assignForm, studentEmail: "" });
  };

  return (
    <div className="action-card">
      <h3>Assign Student</h3>
      <label>Select Batch</label>
      <select 
        value={assignForm.batchId} 
        onChange={(e) => setAssignForm({ ...assignForm, batchId: e.target.value })}
      >
        <option value="">-- Select Batch --</option>
        {batches.map((b) => (
          <option key={b.batchId} value={b.batchId}>
            {b.name} ({b.educationLevel} - {b.className})
          </option>
        ))}
      </select>
      <label>Student Email</label>
      <input 
        value={assignForm.studentEmail} 
        onChange={(e) => setAssignForm({ ...assignForm, studentEmail: e.target.value })} 
      />
      <button onClick={handleAssignStudent}>Assign Student</button>
    </div>
  );
};

export default AssignTab;