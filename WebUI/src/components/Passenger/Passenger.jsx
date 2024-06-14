// Passenger.jsx
import React, { useState } from 'react';
import '../../styles/passenger.css';
import PassengerMapWrapper from './PassengerMapWrapper';
import PassengerForm from './PassengerForm';
import { ThreeDots } from 'react-loader-spinner';
import Swal from 'sweetalert2';
import '../../styles/passenger.css';

const Passenger = () => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const handleSearch = async (data) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8020/api/car/get/riderdetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      setMarkers(result.data);
      setSource(data.source_location);
      setDestination(data.destination_location);
      setTravelDate(data.travel_date);
      alert("Select your suitable ride and book");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleBookNow = async (carId) => {
    console.log("carId------------>",carId);
    const bookingData = {
      source_location: source,
      destination_location: destination,
      travel_date: travelDate,
      carId,
    };

    try {
      const response = await fetch("http://localhost:8020/api/car/post/addPassengerDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });
      const result = await response.json();
      Swal.fire(
        "Success",
        `Booking successful! ${result.message}`,
        "success"
      );
    } catch (error) {
      Swal.fire("Error", "Failed to book the ride.", "error");
      console.error("Error booking the ride:", error);
    }
  };

  return (
    <div className="passenger-container">
      <PassengerForm onSearch={handleSearch} />
      {loading && (
        <div className="loader-container">
          <ThreeDots
            height="100"
            width="100"
            color="#00BFFF"
            ariaLabel="loading"
          />
        </div>
      )}
      <PassengerMapWrapper markers={markers} onBookNow={handleBookNow} />
    </div>
  );
};

export default Passenger;
