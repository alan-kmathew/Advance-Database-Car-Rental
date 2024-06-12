import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import MapWrapper from "./mapComponent";
import FormComponent from "./formComponent";
import Modal from "./modal";
import "../../styles/searchCar/searchEngine.css";

const SearchEngine = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [enableSharing, setEnableSharing] = useState(false);
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [destination, setDestination] = useState("");
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [routeDetails, setRouteDetails] = useState(null); // State to store route details

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8020/api/car/get/servicePoints"
      );
      const data = response.data
        .map((location) => ({
          id: location._id,
          name: location.name,
          coordinates: location.coordinates
            .split(",")
            .map((coord) => parseFloat(coord)),
          image: location.image,
          totalCars: location.totalCars,
          cars: [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
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

  const handleToggleChange = () => {
    setEnableSharing(!enableSharing);
    if (!enableSharing) {
      fetchAllLocations();
    } else {
      setAllLocations([]);
      setDestination('');
    }
  };

  const handleSearch = async () => {
    if (!selectedLocation || !fromDate || !toDate || (enableSharing && !destination)) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }
  
    try {
      let response;
      if (enableSharing) {
        // Hit the passenger route details API
        try {
          response = await axios.post(
            "http://localhost:8020/api/car/get/passengerRouteDetails",
            {
              from_date: fromDate,
              to_date: toDate,
              source_location_id: selectedLocation.id,
              destination_location: destination
            }
          );
          // Check if passenger bookings are found
          if (response.data.status === 200 && response.data.message === "Passenger details and shortest path fetched successfully") {
            // If passenger bookings found, update route details state
            setRouteDetails(response.data.data);
          } else if (response.data.message === "No passenger bookings found for the given criteria") {
            // If no passenger bookings found, show error message
            Swal.fire("Error", "No passenger bookings found for the given criteria", "error");
            return;
          }
        } catch (error) {
          Swal.fire("Error", "Error fetching passenger route details.", "error");
          console.error("Error fetching passenger route details:", error);
        }
      } else {
        // If enableSharing is false, proceed to fetch car rentals directly
        response = await axios.get(
          `http://localhost:8020/api/car/get/carRental?fromLocation=${selectedLocation.id}&startDate=${fromDate}&endDate=${toDate}`
        );
        setCars(response.data);
        setShowModal(true);
      }
    } catch (error) {
      Swal.fire("Error", "Error fetching data.", "error");
      console.error("Error fetching data:", error);
    }
  };

  const handleBooking = async (car) => {
    const bookingData = {
      carId: car._id,
      startDate: new Date(fromDate),
      endDate: new Date(toDate),
      customer: {
        name: "Customer 5",
        email: "customer5@example.com",
      },
      price: car.price,
      servicePointId: selectedLocation.id,
      type: enableSharing ? "sharing" : "rental",
      bookingDate: new Date(),
      destination: enableSharing ? destination : null,
    };

    try {
      const response = await axios.post(
        "http://localhost:8020/api/car/create/booking",
        bookingData
      );
      Swal.fire(
        "Success",
        `Booking successful! Car Plate Number: ${response.data.plateNo}`,
        "success"
      );
      setShowModal(false);
    } catch (error) {
      Swal.fire("Error", "Failed to create booking.", "error");
      console.error("Error creating booking:", error);
    }
  };

  return (
    <div className="search-engine">
      <div className="toggle-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={enableSharing}
            onChange={handleToggleChange}
          />
          <span className="slider"></span>
        </label>
        <span className="txt">Enable Sharing Service</span>
      </div>
      <MapWrapper
        selectedLocation={selectedLocation}
        locations={locations}
        onLocationChange={handleLocationChange}
        fromDate={fromDate}
        toDate={toDate}
        destination={destination}
        enableSharing={enableSharing}
        onSearch={handleSearch}
        routeDetails={routeDetails} // Pass route details to MapWrapper
      />
      <FormComponent
        locations={locations}
        allLocations={allLocations}
        onLocationChange={handleLocationChange}
        enableSharing={enableSharing}
        selectedLocation={selectedLocation}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        destination={destination}
        setDestination={setDestination}
        onSearch={handleSearch}
      />
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2>Available Cars</h2>
        <div className="car-list">
          {cars.map((car) => (
            <div key={car._id} className="car-item">
              <img src={car.image} alt={car.model} />
              <div className="car-item-details">
                <p>Model: {car.model}</p>
                <p>Price: ${car.price.toFixed(2)}</p>
                <p>Color: {car.color}</p>
                <p>Seats: {car.seats}</p>
                <button onClick={() => handleBooking(car)}>Book</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default SearchEngine;
