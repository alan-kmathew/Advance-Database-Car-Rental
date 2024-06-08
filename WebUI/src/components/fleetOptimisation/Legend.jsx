import React from "react";
import "../../styles/Legend.css";

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <img
          src={require("../../Assets/servicepoint.png")}
          alt="Service Point"
        />
        <span>All Service Stations</span>
      </div>
      <div className="legend-item">
        <img
          src={require("../../Assets/red-location-icon.png")}
          alt="Highlighted Service Point"
        />
        <span>Highest Booking Stations</span>
      </div>
      <div className="legend-item">
        <img
          src={require("../../Assets/green-location-icon.png")}
          alt="Nearest Service Point"
        />
        <span>Nearest Locations</span>
      </div>
    </div>
  );
};

export default Legend;
