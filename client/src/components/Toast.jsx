import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      <div className="flex-between gap-2">
        <span>{message}</span>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
