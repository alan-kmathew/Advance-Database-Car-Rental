import React, { useState } from 'react';
import axios from 'axios';
import "../../styles/FleetForm.css";

const FleetOptForm = ({ setServiceStations }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stationCount, setStationCount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`Fetching booking details from ${fromDate} to ${toDate}`);
    console.log(`Number of service stations: ${stationCount}`);

    try {
      const response = await axios.get('http://localhost:8020/api/car/get/station/highbookings', {
        params: {
          fromDate: fromDate,
          toDate: toDate,
          numberOfServiceStations: stationCount
        }
      });
      const stations = response.data.map(station => ({
        latitude: station.latitude,
        longitude: station.longitude,
        servicePointName: station.servicePointName,
        totalBookings: station.totalBookings,
      }));
      setServiceStations(stations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
      <div className="text-info">Get Highest Booking Service station</div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};

export default FleetOptForm;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import "../../styles/FleetForm.css";

// const FleetOptForm = ({ setServiceStations }) => {
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [stationCount, setStationCount] = useState('');

//   const fetchData = async () => {
//     try {
//       const highestBookingResponse = await axios.get('http://localhost:8020/api/car/get/station/highbookings', {
//         params: {
//           fromDate: fromDate,
//           toDate: toDate,
//           numberOfServiceStations: stationCount
//         }
//       });

//       const nearestServiceStationsResponse = await axios.get('http://localhost:8020/api/car/get/nearest/servicestation', {
//         params: {
//           cityName: fromDate // Adjust this according to your API's requirement
//         }
//       });

//       // Combine the results of both API calls
//       const highestBookingStations = highestBookingResponse.data.map(station => ({
//         latitude: station.latitude,
//         longitude: station.longitude,
//         servicePointName: station.servicePointName,
//         totalBookings: station.totalBookings,
//       }));

//       const nearestServiceStations = nearestServiceStationsResponse.data.map(nearestStation => ({
//         latitude: nearestStation.latitude,
//         longitude: nearestStation.longitude,
//         servicePointName: nearestStation.locatedInCity,
//         distanceInMiles: nearestStation.distanceInMiles,
//       }));

//       // Concatenate both arrays
//       const allServiceStations = [...highestBookingStations, ...nearestServiceStations];

//       setServiceStations(allServiceStations);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   useEffect(() => {
//     if (fromDate && toDate && stationCount) {
//       fetchData();
//     }
//   }, [fromDate, toDate, stationCount]); 

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // The API calls will be handled in the useEffect hook
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
//       <div className="input-group">
//         <label>Get Service Stations:</label>
//         <input
//           type="number"
//           value={stationCount}
//           onChange={(e) => setStationCount(e.target.value)}
//           min="1"
//           placeholder="Enter number of stations"
//           required
//         />
//       </div>
//       <div className="text-info">Get Highest Booking and Nearest Service Stations</div>
//       <button type="submit" className="submit-button">Submit</button>
//     </form>
//   );
// };

// export default FleetOptForm;


