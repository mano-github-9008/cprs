import { useEffect, useState, useRef } from "react";
import { fetchAssessment } from "../../services/studentApi";
import { submitResult } from "../../services/resultApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Assessment.css";

const TIMER_KEY = "assessment_start_time";
const DURATION_KEY = "assessment_total_duration";
const ANSWERS_KEY = "assessment_answers";
const VISITED_KEY = "assessment_visited";
const CURRENT_Q_KEY = "assessment_current_q";

const Assessment = () => {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [visited, setVisited] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const autoSubmitRef = useRef(false);

  /* ================= LOAD ASSESSMENT ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAssessment();

        if (res.locked) {
          toast.info(res.reason || "Assessment not accessible");
          navigate("/dashboard");
          return;
        }

        const questionCount = res.assessment.questions.length;
        const totalSeconds = questionCount * res.timePerQuestion;

        setAssessment(res.assessment);

        /* ===== RESTORE ANSWERS ===== */
        const savedAnswers =
          JSON.parse(localStorage.getItem(ANSWERS_KEY)) ||
          new Array(questionCount).fill(null);

        const savedVisited =
          JSON.parse(localStorage.getItem(VISITED_KEY)) ||
          new Array(questionCount).fill(false);

        const savedCurrentQ =
          Number(localStorage.getItem(CURRENT_Q_KEY)) || 0;

        setAnswers(savedAnswers);
        setVisited(savedVisited);
        setCurrentQ(savedCurrentQ);

        /* ===== TIMER RESTORE ===== */
        const now = Date.now();
        const savedStart = localStorage.getItem(TIMER_KEY);
        const savedDuration = localStorage.getItem(DURATION_KEY);

        let startTime;
        let remaining;

        if (savedStart && savedDuration) {
          startTime = Number(savedStart);
          remaining =
            Number(savedDuration) -
            Math.floor((now - startTime) / 1000);
        } else {
          startTime = now;
          remaining = totalSeconds;

          localStorage.setItem(TIMER_KEY, startTime.toString());
          localStorage.setItem(DURATION_KEY, totalSeconds.toString());
        }

        if (remaining <= 0) {
          toast.info("Time already over. Auto-submitting ⏱");
          submit(true);
          return;
        }

        startTimeRef.current = startTime;
        setTimeLeft(remaining);
      } catch {
        toast.error("Failed to load assessment");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [navigate]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!assessment || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [assessment, submitted]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (timeLeft <= 0 && assessment && !submitted && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      toast.info("Time is up! Auto-submitting");
      submit(true);
    }
  }, [timeLeft, assessment, submitted]);

  /* ================= VISITED TRACK ================= */
  useEffect(() => {
    setVisited((prev) => {
      const updated = [...prev];
      updated[currentQ] = true;
      localStorage.setItem(VISITED_KEY, JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem(CURRENT_Q_KEY, currentQ.toString());
  }, [currentQ]);

  /* ================= ANSWER SELECT ================= */
  const handleSelect = (option) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQ] = option;
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (submitted) return;

    try {
      setSubmitted(true);
      clearInterval(timerRef.current);

      const timeSpent = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      await submitResult({ answers, timeSpent });

      /* CLEAR STORAGE */
      [
        TIMER_KEY,
        DURATION_KEY,
        ANSWERS_KEY,
        VISITED_KEY,
        CURRENT_Q_KEY,
      ].forEach((k) => localStorage.removeItem(k));

      toast.success("Assessment submitted successfully");
      navigate("/results");
    } catch (err) {
      toast.error(err.message || "Submission failed");
      setSubmitted(false);
      autoSubmitRef.current = false;
    }
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="loading">Loading assessment...</p>;
  if (!assessment) return <p className="loading">Assessment not available.</p>;

  const question = assessment.questions[currentQ];

  const getPaletteClass = (i) => {
    if (i === currentQ) return "palette-current";
    if (answers[i] !== null) return "palette-answered";
    if (visited[i]) return "palette-visited";
    return "palette-not-visited";
  };

  return (
    <div className="assessment-container">
      {/* HEADER */}
      <div className="assessment-header">
        <h2>AI Assessment</h2>
        <div className="timer-tab">
          <FiClock />
          <span>
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* QUESTION */}
      <div className="question-card">
        <p className="question-text">
          Q{currentQ + 1}. {question.question}
        </p>

        {question.options.map((opt) => (
          <label
            key={opt}
            className={`option-row ${
              answers[currentQ] === opt ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              checked={answers[currentQ] === opt}
              onChange={() => handleSelect(opt)}
            />
            {opt}
          </label>
        ))}
      </div>

      {/* PALETTE */}
      <div className="question-palette">
        {assessment.questions.map((_, i) => (
          <button
            key={i}
            className={`palette-btn ${getPaletteClass(i)}`}
            onClick={() => setCurrentQ(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* NAV */}
      <div className="nav-buttons">
        <button
          className="nav-btn"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
        >
          <FiChevronLeft /> Previous
        </button>

        {currentQ < assessment.questions.length - 1 ? (
          <button
            className="nav-btn"
            onClick={() => setCurrentQ((q) => q + 1)}
          >
            Next <FiChevronRight />
          </button>
        ) : (
          <button className="primary-btn" onClick={submit}>
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default Assessment;
