import { Link } from "react-router-dom";
import { FiBriefcase, FiAward, FiBookOpen, FiCode, FiArrowRight, FiTrendingUp, FiUsers, FiCpu } from "react-icons/fi";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="bg-glow"></div>
      
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="badge">New: AI-Driven Insights 2.0</div>
            <h1>
              AI-Powered <span>Career Path Recommendation</span> Platform
            </h1>
            <p>
              Make informed career decisions using intelligent assessments,
              data-driven insights, and personalized recommendations powered by AI.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn primary">
                Get Started <FiArrowRight />
              </Link>
              <Link to="/login" className="btn secondary">Explore Demo</Link>
            </div>
            
            {/* Quick Stats to add professionalism */}
            <div className="hero-stats">
              <div className="stat-item">
                <strong>10k+</strong>
                <span>Students</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <strong>95%</strong>
                <span>Accuracy</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <strong>50+</strong>
                <span>Career Paths</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit-container">
              <div className="nucleus">
                <div className="logo-glow-inner"></div>
                <span className="logo-icon">CPRS</span>
              </div>

              <div className="orbit-path orbit-1">
                <div className="floating-icon icon-job"><FiBriefcase /></div>
                <div className="floating-icon icon-grad"><FiAward /></div>
              </div>
              <div className="orbit-path orbit-2">
                <div className="floating-icon icon-book"><FiBookOpen /></div>
                <div className="floating-icon icon-code"><FiCode /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose CareerPath AI?</h2>
          <p>Engineered to align your passion with market reality.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon-wrapper"><FiCpu /></div>
            <h3>Intelligent Assessments</h3>
            <p>Adaptive, AI-generated questions that analyze your aptitude and interests beyond traditional tests.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper"><FiTrendingUp /></div>
            <h3>Personalized Mapping</h3>
            <p>Receive customized career pathways perfectly aligned with your unique strengths and goals.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper"><FiUsers /></div>
            <h3>Insight-Driven Results</h3>
            <p>Clear visual analytics that help you understand your potential and long-term career fit.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
  {/* The "Pre-Footer" Call to Action */}
  <div className="footer-cta">
    <div className="cta-glow"></div>
    <h2>Ready to define your future?</h2>
    <p>Join 10,000+ students making data-backed career moves with CPRS AI.</p>
    <Link to="/login" className="btn primary">Start Free Assessment <FiArrowRight /></Link>
  </div>

  <div className="footer-main">
    <div className="footer-brand">
      <div className="nav-logo">
        <div className="logo-badge">
          <span className="logo-icon">CPRS</span>
        </div>
        <span className="logo-text">AI</span>
      </div>
      <p>Precision career pathing powered by advanced machine learning and industry data.</p>
    </div>

    <div className="footer-grid">
      <div className="footer-column">
        <h4>Platform</h4>
        <Link to="/">AI Assessments</Link>
        <Link to="/">Career Mapping</Link>
        <Link to="/">Skill Analysis</Link>
      </div>
      <div className="footer-column">
        <h4>Resources</h4>
        <Link to="/">Documentation</Link>
        <Link to="/">Market Trends</Link>
        <Link to="/">Success Stories</Link>
      </div>
      <div className="footer-column">
        <h4>Legal</h4>
        <Link to="/">Privacy Policy</Link>
        <Link to="/">Terms of Service</Link>
        <Link to="/">Data Security</Link>
      </div>
    </div>
  </div>

  <div className="footer-bottom">
    <p>© 2026 Career Path AI · Built with Science & Soul</p>
    <div className="footer-status">
      <span className="status-dot"></span>
      AI Systems Operational
    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;