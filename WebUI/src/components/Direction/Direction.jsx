import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DirectionsMapWrapper from "./DirectionMapComponent";
import FormComponent from "./directionsForm";
import "../../styles/getDirection.css";

const GetDirections = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [directions, setDirections] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [allLocations, setAllLocations] = useState([]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get("http://localhost:8020/api/car/get/servicePoints");
      const data = response.data.map(location => ({
        id: location._id,
        name: location.name,
        coordinates: location.coordinates.split(",").map(coord => parseFloat(coord)),
      })).sort((a, b) => a.name.localeCompare(b.name));
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchAllLocations();
  }, []);

  const fetchAllLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8020/api/car/get/allLocationsInMap"
      );
      const sortedData = response.data[0].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAllLocations(sortedData);
    } catch (error) {
      console.error("Error fetching all locations:", error);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleSearch = async () => {
    if (!selectedLocation || !destination || !fromDate || !toDate) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8020/api/car/get/passengerRouteDetails", {
        from_date: fromDate,
        to_date: toDate,
        source_location_id: selectedLocation.id,
        destination_location: destination
      });
      setDirections(response.data.data);
      console.log("Directions:", response.data.data);
    } catch (error) {
      Swal.fire("Error", "Error fetching directions.", "error");
      console.error("Error fetching directions:", error);
    }
  };

  return (
    <div className="get-directions">
      <FormComponent
        locations={locations}
        selectedLocation={selectedLocation}
        allLocations={allLocations}
        onLocationChange={handleLocationChange}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        destination={destination}
        setDestination={setDestination}
        onSearch={handleSearch}
      />
      <DirectionsMapWrapper
        selectedLocation={selectedLocation}
        locations={locations}
        onLocationChange={handleLocationChange}
        directions={directions}
      />
    </div>
  );
};

export default GetDirections;
