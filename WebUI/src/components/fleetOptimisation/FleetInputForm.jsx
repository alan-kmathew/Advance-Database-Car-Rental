import React, { useState } from "react";
import axios from "axios";
import "../../styles/FleetInputForm.css";

const FleetInputForm = ({ setServiceStations }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stationCount, setStationCount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        "http://localhost:8020/api/car/get/station/highbookings",
        {
          params: {
            fromDate: fromDate,
            toDate: toDate,
            numberOfServiceStations: stationCount,
          },
        }
      );
      const stations = response.data.map((station) => ({
        latitude: station.latitude,
        longitude: station.longitude,
        servicePointName: station.servicePointName,
        totalBookings: station.totalBookings,
        totalCarsAvailable: station.totalCarsAvailable,
        nearestServiceStations: station.nearestServiceStations,
        carList: station.carList,
        servicePointImage: station.servicePointImage,
      }));
      setServiceStations(stations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <form className="fleet-opt-form" onSubmit={handleSubmit}>
      <label>Get Highest Booking Service Stations</label>
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
        <label>Number of Service Stations:</label>
        <input
          type="number"
          value={stationCount}
          onChange={(e) => setStationCount(e.target.value)}
          min="1"
          placeholder="Enter number of stations"
          required
        />
      </div>

      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default FleetInputForm;
