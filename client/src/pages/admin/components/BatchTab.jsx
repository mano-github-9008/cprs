import { useState } from "react";
import { toast } from "react-toastify";
import { createBatch } from "../../../services/batchApi";
import "./BatchTab.css";


const BatchTab = ({ institution }) => {
    const [batchForm, setBatchForm] = useState({
        name: "",
        className: "",
        educationLevel: "",
        date: "",
        startTime: "",
        endTime: "",
        maxStudents: 50,
    });

    const handleCreateBatch = async () => {
        if (!institution) return toast.error("Create institution first");
        if (!batchForm.name || !batchForm.className || !batchForm.educationLevel) {
            return toast.error("Batch name, class & education level required");
        }

        const res = await createBatch({
            name: batchForm.name,
            className: batchForm.className,
            educationLevel: batchForm.educationLevel,
            slot: {
                date: batchForm.date,
                startTime: batchForm.startTime,
                endTime: batchForm.endTime,
            },
            maxStudents: batchForm.maxStudents,
        });

        if (res.batch) {
            setBatchForm({ name: "", className: "", educationLevel: "", date: "", startTime: "", endTime: "", maxStudents: 50 });
            toast.success("Batch created successfully");
        }
    };

    return (
        <div className="action-card">
            <h3>Create Batch</h3>
            <label>Batch Name</label>
            <input value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} />
            <label>Class / Section</label>
            <input placeholder="e.g. CSE-A" value={batchForm.className} onChange={(e) => setBatchForm({ ...batchForm, className: e.target.value })} />
            <label>Education Level</label>
            <select value={batchForm.educationLevel} onChange={(e) => setBatchForm({ ...batchForm, educationLevel: e.target.value })}>
                <option value="">-- Select Level --</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="Diploma">Diploma</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
            </select>
            <label>Date</label>
            <input type="date" value={batchForm.date} onChange={(e) => setBatchForm({ ...batchForm, date: e.target.value })} />
            <div className="batch-time-row">
                <div>
                    <label>Start Time</label>
                    <input
                        type="time"
                        value={batchForm.startTime}
                        onChange={(e) =>
                            setBatchForm({ ...batchForm, startTime: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label>End Time</label>
                    <input
                        type="time"
                        value={batchForm.endTime}
                        onChange={(e) =>
                            setBatchForm({ ...batchForm, endTime: e.target.value })
                        }
                    />
                </div>
            </div>

            <label>Max Students</label>
            <input type="number" value={batchForm.maxStudents} onChange={(e) => setBatchForm({ ...batchForm, maxStudents: Number(e.target.value) })} />
            <button onClick={handleCreateBatch}>Create Batch</button>
        </div>
    );
};

export default BatchTab;