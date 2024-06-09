import React from "react";
import "../../styles/OptimizationDisplay.css";

const OptimizationDisplay = ({ distance, fromStation, selectedStations }) => {
  // Calculate the total cars to deliver
  const totalCars = selectedStations.reduce(
    (acc, station) => acc + station.cars.length,
    0
  );

  // Calculate the total drivers required
  const totalDrivers = totalCars;

  // Calculate the number of spare drivers needed to pick up the drivers
  const spareDriversNeeded = Math.ceil(totalDrivers / 3);

  return (
    <div className="distance-display">
      <p>From Station: {fromStation}</p>
      {selectedStations.map((station, index) => (
        <div key={index}>
          <p>To Station: {station.name}</p>
          <p>Cars to Deliver: {station.cars.length}</p>
        </div>
      ))}
      <p>Total Cars to Deliver: {totalCars}</p>
      <p>Total Drivers Required: {totalDrivers}</p>
      <p>Spare Drivers Needed: {spareDriversNeeded}</p>
      <p>Spare Cars Needed: {spareDriversNeeded}</p>
      <p>Total Distance : {Math.round(distance * 1.60934)} km</p>
    </div>
  );
};

export default OptimizationDisplay;
