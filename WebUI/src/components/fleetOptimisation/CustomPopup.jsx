import React from "react";
import "../../styles/FleetOpt.css"; // Import the CSS file if needed

const CustomPopup = ({ info, onClose }) => (
  <div
    className="custom-popup"
    style={{
      top: info.position.y,
      left: info.position.x,
    }}
  >
    <button className="custom-popup-close-btn" onClick={onClose}>
      ✕
    </button>
    <h3>{info.name || info.servicePointName}</h3>
    {info.totalCars !== undefined && <p>Total Cars: {info.totalCars}</p>}
    {info.totalBookings !== undefined && (
      <p>Total Bookings: {info.totalBookings}</p>
    )}
  </div>
);

export default CustomPopup;
