import { useState } from "react";
import { toast } from "react-toastify";
import { createInstitution } from "../../../services/institutionApi";
import "./InstitutionTab.css";

const InstitutionTab = ({ institution, setInstitution }) => {
  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    code: "",
    address: "",
    website: "",
  });

  const handleCreateInstitution = async () => {
    if (!institutionForm.name || !institutionForm.code) {
      return toast.error("Institution name & code required");
    }
    const res = await createInstitution(institutionForm);
    setInstitution(res.institution);
    toast.success("Institution created successfully");
  };

  return (
    <div className="action-card">
      <h3>Institution</h3>
      {institution ? (
        <div className="institution-info">
          <p><strong>Name:</strong> {institution.name}</p>
          <p><strong>Code:</strong> {institution.code}</p>
          {institution.address && <p><strong>Address:</strong> {institution.address}</p>}
          {institution.website && <p><strong>Website:</strong> {institution.website}</p>}
        </div>
      ) : (
        <>
          <label>Institution Name</label>
          <input
            value={institutionForm.name}
            onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
          />
          <label>Institution Code</label>
          <input
            value={institutionForm.code}
            onChange={(e) => setInstitutionForm({ ...institutionForm, code: e.target.value.toUpperCase() })}
          />
          <label>Address</label>
          <input
            value={institutionForm.address}
            onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
          />
          <label>Website</label>
          <input
            value={institutionForm.website}
            onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
          />
          <button onClick={handleCreateInstitution}>Create Institution</button>
        </>
      )}
    </div>
  );
};

export default InstitutionTab;