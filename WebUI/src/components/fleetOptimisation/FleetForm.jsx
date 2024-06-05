// import React, { useState } from 'react';
// import "../../styles/FleetForm.css"

// const FleetOptForm = () => {
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log(`Fetching booking details from ${fromDate} to ${toDate}`);
//   };

//   return (
//     <form className="fleet-opt-form" onSubmit={handleSubmit}>
//       <div className="input-group">
//         <label>From Date:</label>
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           required
//         />
//       </div>
//       <div className="input-group">
//         <label>To Date:</label>
//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           required
//         />
//       </div>
//       <div className="text-info">Get Booking Details</div>
//       <button type="submit" className="submit-button">Submit</button>
//     </form>
//   );
// };

// export default FleetOptForm;

import React, { useState } from 'react';
import "../../styles/FleetForm.css";

const FleetOptForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stationCount, setStationCount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Fetching booking details from ${fromDate} to ${toDate}`);
    console.log(`Number of service stations: ${stationCount}`);
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
      <div className="input-group">
        <label>Get Service Stations:</label>
        <input
          type="number"
          value={stationCount}
          onChange={(e) => setStationCount(e.target.value)}
          min="1"
          placeholder="Enter number of stations"
          required
        />
      </div>
      <div className="text-info">Get Booking Details</div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};

export default FleetOptForm;