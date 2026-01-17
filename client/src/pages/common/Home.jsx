import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Background Decorative Element */}
      <div className="bg-glow"></div>
      
      <section className="hero">
        <div className="hero-content">
          <div className="badge">New: AI-Driven Insights 2.0</div>
          <h1>
            AI-Powered <span>Career Path Recommendation</span> Platform
          </h1>
          <p>
            Make informed career decisions using intelligent assessments,
            data-driven insights, and personalized recommendations powered by AI.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn primary">Get Started</Link>
            <Link to="/login" className="btn secondary">Explore Demo</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <h2>Why Choose CareerPath AI?</h2>
          <p>Engineered to align your passion with market reality.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon">🤖</div>
            <h3>Intelligent Assessments</h3>
            <p>Adaptive, AI-generated questions that analyze your aptitude and interests beyond traditional tests.</p>
          </div>

          <div className="feature-card">
            <div className="icon">🎯</div>
            <h3>Personalized Mapping</h3>
            <p>Receive customized career pathways perfectly aligned with your unique strengths and goals.</p>
          </div>

          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Insight-Driven Results</h3>
            <p>Clear visual analytics that help you understand your potential and long-term career fit.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2026 Career Path AI · Built with Science</p>
      </footer>
    </div>
  );
};

export default Home;