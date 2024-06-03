// FleetOptForm.js
import React, { useState } from 'react';
import "../../styles/FleetForm.css"

const FleetOptForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add your logic here to fetch and display booking details
    console.log(`Fetching booking details from ${fromDate} to ${toDate}`);
  };

  return (
    <form className="fleet-opt-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>From Date:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>To Date:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />
      </div>
      <div className="text-info">Get Booking Details</div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};

export default FleetOptForm;