import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchBatches } from "../../../services/batchApi";
import { generateAssessment } from "../../../services/aiApi";
import LoadingSpinner from "../../common/LoadingSpinner"; 
import "./AiBuilderTab.css";


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AiBuilderTab = ({ institution }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [autopilot, setAutopilot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiEducationLevel, setAiEducationLevel] = useState("");
  const [syllabusFile, setSyllabusFile] = useState(null);

  const [categories, setCategories] = useState({
    logical: true,
    technical: false,
    communication: false,
    problemSolving: false,
  });
  
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [customPrompt, setCustomPrompt] = useState("");

  const categoryMap = {
    "10th": ["logical", "problemSolving"],
    "12th": ["logical", "problemSolving"],
    Diploma: ["logical", "technical"],
    UG: ["logical", "technical", "problemSolving"],
    PG: ["technical", "communication", "problemSolving"],
  };

  useEffect(() => {
    fetchBatches().then((res) => setBatches(res.batches || []));
  }, []);

  useEffect(() => {
    const b = batches.find((x) => x.batchId === selectedBatchId);
    setSelectedBatch(b || null);
  }, [selectedBatchId, batches]);

  const handleAiEducationChange = (level) => {
    setAiEducationLevel(level);
    const allowed = categoryMap[level] || [];
    const updated = {};
    Object.keys(categories).forEach((c) => {
      updated[c] = allowed.includes(c);
    });
    setCategories(updated);
  };

  const handleGenerate = async () => {
    if (!institution) return toast.error("Create institution first");
    if (!selectedBatch) return toast.error("Select batch first");

    const toastId = toast.loading("Generating assessment...");
    setLoading(true);

    try {
      await sleep(300);
      await generateAssessment({
        payload: {
          mode: autopilot ? "autopilot" : "manual",
          config: {
            batchId: selectedBatch.batchId,
            slot: selectedBatch.slot,
            categories: Object.keys(categories).filter((k) => categories[k]),
            difficulty,
            questionCount,
            timePerQuestion,
            customPrompt,
          },
        },
        syllabusFile,
      });
      toast.update(toastId, { render: "Assessment generated successfully ✅", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: err.message || "AI generation failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-card wide" style={{ position: 'relative' }}>
      {/* Overlay Spinner covers the card during generation */}
      {loading && <LoadingSpinner message="AI is crafting your assessment..." />}

      <h3>AI Assessment Builder</h3>

      <label className="checkbox">
        <input type="checkbox" checked={autopilot} onChange={() => setAutopilot(!autopilot)} />
        Autopilot Mode (AI decides everything)
      </label>

      <label>Select Batch</label>
      <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
        <option value="">-- Select Batch --</option>
        {batches.map((b) => (
          <option key={b.batchId} value={b.batchId}>
            {b.name} ({b.educationLevel} - {b.className})
          </option>
        ))}
      </select>

      <label>Education Level (AI Context)</label>
      <select value={aiEducationLevel} onChange={(e) => handleAiEducationChange(e.target.value)}>
        <option value="">-- Select Level --</option>
        {["10th", "12th", "Diploma", "UG", "PG"].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
      </select>

      <label>Optional Syllabus / Reference PDF</label>
      <input type="file" accept=".pdf" onChange={(e) => setSyllabusFile(e.target.files[0])} />

      {!autopilot && (
        <>
          <hr />
          <label>Question Categories</label>
          <div className="checkbox-group">
            {Object.keys(categories).map((c) => (
              <label key={c} className="checkbox">
                <input type="checkbox" checked={categories[c]} onChange={() => setCategories({ ...categories, [c]: !categories[c] })} />
                {c.replace(/([A-Z])/g, ' $1')}
              </label>
            ))}
          </div>

          <label>Difficulty Level</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label>Number of Questions</label>
          <input type="number" min={1} value={questionCount} onChange={(e) => setQuestionCount(+e.target.value)} />

          <label>Time per Question (seconds)</label>
          <input type="number" min={10} value={timePerQuestion} onChange={(e) => setTimePerQuestion(+e.target.value)} />

          <label>Custom Instructions</label>
          <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g. Focus more on React hooks..." />
        </>
      )}

      {selectedBatch && (
        <div className="slot-info-box">
          <p className="slot-info">
            <strong>Scheduled Slot:</strong> {selectedBatch.slot?.date} ({selectedBatch.slot?.startTime} – {selectedBatch.slot?.endTime})
          </p>
        </div>
      )}

      <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Assessment"}
      </button>
    </div>
  );
};

export default AiBuilderTab;