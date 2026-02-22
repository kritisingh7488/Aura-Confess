import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        <div className="glitch-wrapper">
          <div className="glitch" data-text="404">404</div>
        </div>
        
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          The page you're looking for has vanished into the digital void...
        </p>
        
        <div className="notfound-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            → Go to Dashboard
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Go Back
          </button>
        </div>
        
        <div className="notfound-animation">
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>
          <div className="center-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
