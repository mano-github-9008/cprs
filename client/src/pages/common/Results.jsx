import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchMyResult } from "../../services/resultApi";
import "./Results.css";

const Results = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyResult();

        if (!res || res.locked) {
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
  if (!result) return <p>No results available</p>;

  const categoryScores = Array.isArray(result.categoryScores)
    ? result.categoryScores
    : [];

  const labels = categoryScores.map((c) => c.category);
  const values = categoryScores.map((c) => c.percentage);

  return (
    <div className="results-container">
      <h2>📊 Your Performance Summary</h2>

      {categoryScores.length > 0 && (
        <>
          <div className="chart-box">
            <Pie
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                    backgroundColor: [
                      "#4b5cff",
                      "#22c55e",
                      "#f97316",
                      "#ef4444",
                    ],
                  },
                ],
              }}
            />
          </div>

          <div className="chart-box">
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: "Score %",
                    data: values,
                    backgroundColor: "#4b5cff",
                  },
                ],
              }}
            />
          </div>
        </>
      )}

      <h3>🧠 Strength Areas</h3>
      <ul>
        {(result.strengths || []).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h3>🎓 Recommended Careers</h3>
      <ul>
        {(result.recommendedCareers || []).map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <p className="score">
        Overall Score: <strong>{result.overallPercentage || 0}%</strong>
      </p>
    </div>
  );
};

export default Results;
