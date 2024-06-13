import React from "react";
import "../../styles/NOLFleetCarDisplayModal.css";


const NOLFleetCarDisplayModal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          X
        </button>
        <div className="modal-content">{children}</div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br /> <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />/
        <br />
        <br />
        <br /> <br />
        <br />
        <br />
        <br />
        <br />
        
      </div>
    </div>
  );
};

export default NOLFleetCarDisplayModal;
