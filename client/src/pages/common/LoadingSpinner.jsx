import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Processing..." }) => (
  <div className="spinner-overlay">
    <div className="spinner-container">
      <div className="loading-ring"></div>
      <p className="loading-message">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;