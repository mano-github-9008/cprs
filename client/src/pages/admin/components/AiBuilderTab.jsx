import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FiZap, FiSettings, FiFilePlus, FiUsers, 
  FiCpu, FiClock, FiBarChart, FiCalendar 
} from "react-icons/fi"; 
import { IoDocumentTextOutline } from "react-icons/io5";
import { fetchBatches } from "../../../services/batchApi";
import { generateAssessment } from "../../../services/aiApi";
import LoadingSpinner from "../../common/LoadingSpinner"; 
import "./AiBuilderTab.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const AiBuilderTab = ({ institution, currentUser }) => { // Added currentUser for 'createdBy'
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [autopilot, setAutopilot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiEducationLevel, setAiEducationLevel] = useState("");
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [targetClassName, setTargetClassName] = useState("");

  // --- NEW STATE FOR VALIDATION FIX ---
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  // ------------------------------------

  const [questionCount, setQuestionCount] = useState(10);
  const [categories, setCategories] = useState({
    logical: true, technical: false, communication: false, problemSolving: false,
  });
  const [difficulty, setDifficulty] = useState("medium");
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [customPrompt, setCustomPrompt] = useState("");

  const categoryMap = {
    "10th": ["logical", "problemSolving"],
    "12th": ["logical", "problemSolving"],
    "Diploma": ["logical", "technical"],
    "UG": ["logical", "technical", "problemSolving"],
    "PG": ["technical", "communication", "problemSolving"],
  };

  useEffect(() => {
    fetchBatches().then((res) => setBatches(res.batches || []));
  }, []);

  useEffect(() => {
    const b = batches.find((x) => String(x.batchId) === String(selectedBatchId));
    setSelectedBatch(b || null);
    if (b && !autopilot) {
      setTargetClassName(b.className || "");
    }
  }, [selectedBatchId, batches, autopilot]);

  const handleAiEducationChange = (level) => {
    setAiEducationLevel(level);
    if (!level) return;
    const allowed = categoryMap[level] || [];
    const updated = {};
    Object.keys(categories).forEach((c) => {
      updated[c] = allowed.includes(c);
    });
    setCategories(updated);
  };

  const handleGenerate = async () => {
    // 1. Critical Validation
    if (!institution?._id) return toast.error("Institution context missing");
    
    // In Autopilot, we allow targetClassName to be optional if the AI is 
    // expected to derive it from student profiles, but usually, a 'Class Hint' helps.
    if (autopilot && !targetClassName) {
       toast.info("Autopilot will attempt to group students by profile details.");
    }

    if (!autopilot) {
      if (!selectedBatch) return toast.error("Select a batch or enable Autopilot");
      if (!aiEducationLevel) return toast.error("Select Education Level");
    }

    const toastId = toast.loading(autopilot ? "AI Analyzing Profiles & Creating Batches..." : "Generating Assessment...");
    setLoading(true);

    try {
      await sleep(500);
      const formData = new FormData();
      
      if (syllabusFile) formData.append("pdf", syllabusFile);
      
      const payload = {
        mode: autopilot ? "autopilot" : "manual",
        institutionId: institution._id,
        // If autopilot is on, we tell the backend to use the Admin's ID as the creator
        createdBy: institution.adminId || currentUser?.id, 
        
        // Dynamic Slotting: AI creates a default slot if one isn't picked
        slot: {
          date: scheduledDate, 
          startTime: startTime,
          endTime: endTime,
        },

        config: {
          // KEY CHANGE: Signal backend to create a new batch based on profiles
          batchId: autopilot ? "CREATE_FROM_PROFILES" : selectedBatch.batchId,
          className: targetClassName || (autopilot ? "AI Generated Class" : selectedBatch?.className),
          educationLevel: autopilot ? "AUTO_DETECT" : aiEducationLevel,
          questionCount: Number(questionCount),
          customPrompt: autopilot 
            ? `Target student profiles. ${customPrompt}` 
            : customPrompt,
          categories: Object.keys(categories).filter((k) => categories[k]),
          difficulty: autopilot ? "adaptive" : difficulty,
          timePerQuestion: Number(timePerQuestion),
          
          autopilotSettings: {
            createBatchesIfMissing: autopilot,
            matchProfileSkills: true, // Tell AI to read StudentProfile.js models
            source: syllabusFile ? "PDF_REFERENCE" : "PROFILE_MATCHING"
          }
        }
      };

      formData.append("payload", JSON.stringify(payload));
      
      // Calls aiApi.js which routes to aiController.js [cite: 4, 6]
      await generateAssessment(formData);
      
      toast.update(toastId, { render: "Autopilot Successful! Batches Created. ✅", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Autopilot Failed";
      toast.update(toastId, { render: errorMsg, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-card wide" style={{ position: 'relative' }}>
      {loading && <LoadingSpinner message={autopilot ? "Scanning Student Data..." : "Crafting Questions..."} />}

      <div className="builder-header">
        <div className="title-area">
          <FiCpu className="header-icon" />
          <h3>AI Assessment Builder</h3>
        </div>
        <label className={`autopilot-toggle-chip ${autopilot ? 'active' : ''}`}>
          <input type="checkbox" checked={autopilot} onChange={() => setAutopilot(!autopilot)} />
          <div className="chip-content">
            {autopilot ? <FiZap className="chip-icon" /> : <FiSettings className="chip-icon" />}
            <span>{autopilot ? "Autopilot" : "Manual"}</span>
          </div>
        </label>
      </div>

      <div className="main-config-grid">
        {!autopilot ? (
          <div className="form-group fade-in">
            <label>Education Level</label>
            <select value={aiEducationLevel} onChange={(e) => handleAiEducationChange(e.target.value)}>
              <option value="">-- Select --</option>
              {Object.keys(categoryMap).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </div>
        ) : (
          <div className="form-group autopilot-info-box fade-in">
            <label>Education Context</label>
            <div className="auto-detect-badge">
              <FiUsers className="badge-icon" /> Auto-Detect
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Questions</label>
          <input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} />
        </div>
      </div>

      {/* --- ADDED SCHEDULING SECTION TO RESOLVE VALIDATION ERRORS --- */}
      <div className="scheduling-grid">
        <div className="form-group">
          <label><FiCalendar className="label-icon" /> Exam Date</label>
          <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label><FiClock className="label-icon" /> Start Time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label><FiClock className="label-icon" /> End Time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>
      <hr className="divider" />

      <div className="reference-section">
        {!autopilot && (
          <div className="form-group">
            <label>Target Batch</label>
            <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
              <option value="">-- Choose --</option>
              {batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Class Name</label>
          <input type="text" placeholder="e.g. B.Tech CS" value={targetClassName} onChange={(e) => setTargetClassName(e.target.value)} />
        </div>

        <div className="form-group full-width">
          <label className="file-upload-label">
            Source PDF (Optional)
            <div className="file-input-wrapper">
               <input type="file" accept=".pdf" onChange={(e) => setSyllabusFile(e.target.files[0])} />
               <div className="file-display">
                  {syllabusFile ? <IoDocumentTextOutline className="file-icon active" /> : <FiFilePlus className="file-icon" />}
                  <span className="file-hint">{syllabusFile ? syllabusFile.name : "Upload Reference"}</span>
               </div>
            </div>
          </label>
        </div>
      </div>

      <div className="prompt-container">
        <label>Custom Prompt / Custom Questions</label>
        <textarea 
          value={customPrompt} 
          onChange={(e) => setCustomPrompt(e.target.value)} 
          placeholder="Type specific topics or manually add questions here..."
          rows={3}
        />
      </div>

      {!autopilot && (
        <div className="advanced-settings fade-in">
          <hr />
          <div className="checkbox-group">
            {Object.keys(categories).map((c) => (
              <label key={c} className="checkbox">
                <input type="checkbox" checked={categories[c]} onChange={() => setCategories({ ...categories, [c]: !categories[c] })} />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>

          <div className="builder-grid">
            <div className="form-group">
              <label><FiBarChart className="label-icon" /> Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
                <label><FiClock className="label-icon" /> Sec/Question</label>
                <input type="number" value={timePerQuestion} onChange={(e) => setTimePerQuestion(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
        {autopilot ? <FiZap className="btn-icon" /> : <FiSettings className="btn-icon" />}
        <span>{autopilot ? "Run AI Autopilot" : "Generate Manual"}</span>
      </button>
    </div>
  );
};

export default AiBuilderTab;