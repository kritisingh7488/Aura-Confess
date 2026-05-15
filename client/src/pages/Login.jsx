import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-page">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <h1 className="logo-text glow">
              AURA<span className="logo-accent">CONFESS</span>
            </h1>
            <div className="logo-tagline">Anonymous. Gamified. Epic.</div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🎭</span>
              <span>Post Anonymous Confessions</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Earn Aura Points</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Climb the Leaderboard</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔓</span>
              <span>Unlock Premium Confessions</span>
            </div>
          </div>

          <button 
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="google-icon" />
            <span>Login with Google</span>
          </button>

          <div className="login-footer">
            <div className="power-level">
              POWER LEVEL: <span className="glow">9000+</span>
            </div>
          </div>
        </div>

        <div className="floating-elements">
          <div className="float float-1">⚡</div>
          <div className="float float-2">🎮</div>
          <div className="float float-3">💎</div>
          <div className="float float-4">🔥</div>
          <div className="float float-5">⭐</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
