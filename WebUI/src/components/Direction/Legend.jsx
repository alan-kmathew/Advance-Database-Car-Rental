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
        <span>Starting Location</span>
      </div>
      <div className="legend-item">
        <img
          src={require("../../Assets/red-location-icon.png")}
          alt="Highlighted Service Point"
        />
        <span>Destination Location</span>
      </div>
      <div className="legend-item">
        <img
          src={require("../../Assets/green-location-icon.png")}
          alt="Nearest Service Point"
        />
        <span>Passenger Location</span>
      </div>
      <div className="legend-item">
        <img
          src={require("../../Assets/nearestrouteicon.png")}
          alt="Nearest Route Icon"
        />
        <span>Intermediate Shortest Location</span>
      </div>
     
      <div className="legend-item">
        <div className="line" style={{ borderTop: "3px dashed blue" }} />
        <span>Shortest Path</span>
      </div>
    </div>
  );
};

export default Legend;
