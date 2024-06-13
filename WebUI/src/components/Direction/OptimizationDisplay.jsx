import React from "react";
import "../../styles/OptimizationDisplay.css";

const OptimizationDisplay = ({ noOfPassengers, totalDistance }) => {
  // Calculate the total cars to deliver
 
  return (
    <div className="distance-display">
      <p>Total No of Passengers: {noOfPassengers}</p>
      <p>Total Distance : {Math.round(totalDistance * 1.60934)} km</p>
    </div>
  );
};

export default OptimizationDisplay;
