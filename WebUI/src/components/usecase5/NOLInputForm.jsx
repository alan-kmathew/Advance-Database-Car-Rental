import React, { useState } from "react";
import axios from "axios";
import "../../styles/FleetInputForm.css";

const NOLInputForm = ({ setServiceStations }) => {
  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        "http://localhost:8020/api/car/get/station/highbookings",
        {
          params: {
            name: name,
            longitude: longitude,
            latitude: latitude,
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
      <label>Find Service Stations by Name and Location</label>
      <div className="input-group">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Longitude:</label>
        <input
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label>Latitude:</label>
        <input
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default NOLInputForm;
