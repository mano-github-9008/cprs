import { useEffect, useRef, useState } from "react";
import { fetchAssessment } from "../../services/studentApi";
import { submitAssessment } from "../../services/resultApi";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentDashboard.css";


const StudentAssessment = () => {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchAssessment().then((res) => {
      if (res.locked) {
        setLocked(true);
        window.location.href = "/results";
        return;
      }

      setAssessment(res.assessment);
      const totalTime =
        res.assessment.questions.length * res.timePerQuestion;

      setTimeLeft(totalTime);
      startTimeRef.current = Date.now();
    });
  }, []);

  useEffect(() => {
    if (!timeLeft || locked) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, locked]);

  const handleAutoSubmit = async () => {
    clearInterval(timerRef.current);
    const timeSpent = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    await submitAssessment({
      answers,
      timeSpent,
    });

    window.location.href = "/results";
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    const timeSpent = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    await submitAssessment({
      answers,
      timeSpent,
    });

    window.location.href = "/results";
  };

  if (!assessment) return <p>Loading assessment...</p>;

  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        <div className="timer">⏱ {timeLeft}s</div>

        {assessment.questions.map((q, i) => (
          <div key={i} className="question-card">
            <h4>
              {i + 1}. {q.question}
            </h4>

            {q.options.map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  name={`q-${i}`}
                  checked={answers[i] === opt}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [i]: opt }))
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <button className="primary-btn" onClick={handleSubmit}>
          Submit Assessment
        </button>
      </main>
    </div>
  );
};

export default StudentAssessment;
