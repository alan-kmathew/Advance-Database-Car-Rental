import React from 'react';
import "../../styles/EventDetails.css"

function EventDetails({ cityName, totalAvailableCars }) {
  return (
    <div className="event-details-container">
      <h2 className="event-details-title">Service Point Information</h2>
      <div className="event-details-content">
        <p><strong>City Name:</strong> {cityName}</p>
        <p><strong>Total Available Cars:</strong> {totalAvailableCars}</p>
      </div>
    </div>
  );
}

export default EventDetails;
