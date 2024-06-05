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


