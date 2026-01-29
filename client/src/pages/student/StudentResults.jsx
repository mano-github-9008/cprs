import { useEffect, useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import { fetchMyResult } from "../../services/resultApi";
import "./StudentDashboard.css";

const StudentResults = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyResult();

        if (res.locked) {
          setResult(null);
        } else {
          setResult(res);
        }
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p>Loading results...</p>;

  if (!result) {
    return (
      <div className="student-layout">
        <StudentSidebar />
        <main className="student-main">
          <h2>Result not available yet</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        <h1>Assessment Results</h1>

        <div className="result-card">
          <h3>Overall Score: {result.overallPercentage}%</h3>

          <h4>Category Performance</h4>
          {(result.categoryScores || []).map((c) => (
            <p key={c.category}>
              {c.category}: {c.percentage}%
            </p>
          ))}

          <h4>Strengths</h4>
          <ul>
            {(result.strengths || []).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h4>Recommended Careers</h4>
          <ul>
            {(result.recommendedCareers || []).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <p>Time Spent: {result.timeSpent || 0}s</p>
        </div>
      </main>
    </div>
  );
};

export default StudentResults;
