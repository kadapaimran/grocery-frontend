//import React from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/LandingPage.css'; // Import the CSS file

function LandingPage() {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <div className="hero-content">
        <div>
          <h1>Fresh Groceries Delivered</h1>
          <p>Quality products from local farms to your table</p>
        </div>
        
        {/* Login/Signup Buttons */}
        <div className="button-container">
          <button 
            onClick={handleSignup}
            className="btn btn-primary"
          >
            Get Started
          </button>
          <button 
            onClick={handleLogin}
            className="btn btn-secondary"
          >
            Login
          </button>
        </div>
        
        <p className="tagline">
          Join thousands of satisfied customers today
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
