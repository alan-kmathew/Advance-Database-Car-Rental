import React from 'react';
import "../../styles/FleetOptDetails.css";

function FleetOptDetails({ servicePointName, totalBookings }) {
  return (
    <div className="fleet-opt-details">
      <strong>{servicePointName}</strong>
      <p>Bookings: {totalBookings}</p>
    </div>
  );
}

export default FleetOptDetails;
