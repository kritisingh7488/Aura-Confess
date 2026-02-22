import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-3">
          <h3>{title}</h3>
          <button 
            onClick={onClose}
            className="btn btn-danger"
            style={{ padding: '6px 12px' }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
