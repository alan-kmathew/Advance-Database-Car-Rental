import React, { useState, useEffect } from 'react';
import { useMap, Polyline, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import CustomDropdown from './CustomDropdownEvent'; // Import the new component
import "../../styles/EventbookingForm.css";

const NewIcon = L.icon({
  iconUrl: require("../../Assets/loc-icon.png"),
  iconSize: [38, 38],
});

const EventBookingForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedServicePoint, setSelectedServicePoint] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [selectedCarType, setSelectedCarType] = useState('');
  const [numOfCars, setNumOfCars] = useState(1);
  const [availableCars, setAvailableCars] = useState(0);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [destinationCoordinates, setDestinationCoordinates] = useState([]);
  
  const servicePoints = ["Heidelberg", "Mannheim", "Berlin", "Frankfurt"];
  const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback"];
  const destinationOptions = ["Berlin", "Dortmund", "Munich", "Leipzig"];

  const map = useMap();

  useEffect(() => {
    if (selectedServicePoint) {
      const servicePointCoordinates = getCoordinatesOfServicePoint(selectedServicePoint);
      map.setView(servicePointCoordinates, 12);
    } else {
      map.setView([51.1657, 10.4515], 6); // Default view of Germany
    }
  }, [selectedServicePoint, map]);

  useEffect(() => {
    if (destinations.length > 0) {
      const lastDestination = destinations[destinations.length - 1];
      const lastCoordinates = getCoordinatesOfServicePoint(lastDestination);
      map.setView(lastCoordinates, 6);
    }
  }, [destinations, map]);

  const handleSearch = () => {
    const available = Math.floor(Math.random() * 100);
    setAvailableCars(available);

    if (numOfCars <= available) {
      setDeliveryEnabled(true);
    } else {
      setDeliveryEnabled(false);
      setScanning(true);
    }
  };

  const handleDelivery = () => {
    alert("Delivery initiated!");
  };

  const handleServicePointSelection = (point) => {
    setSelectedServicePoint(point);
    const coordinates = getCoordinatesOfServicePoint(point);
    setDestinationCoordinates([coordinates]);
  };

  const getCoordinatesOfServicePoint = (point) => {
    switch (point) {
      case 'Heidelberg':
        return [49.3988, 8.6724];
      case 'Mannheim':
        return [49.4875, 8.4660];
      case 'Berlin':
        return [52.52, 13.4050];
      case 'Frankfurt':
        return [50.1109, 8.6821];
      case 'Dortmund':
        return [51.5136, 7.4653];
      case 'Munich':
        return [48.1351, 11.5820];
      case 'Leipzig':
        return [51.3397, 12.3731];
      default:
        return [0, 0];
    }
  };

  const handleDestinationChange = (value) => {
    const destinationCoords = getCoordinatesOfServicePoint(value);
    if (destinations.includes(value)) {
      // Remove the deselected destination and its coordinates
      setDestinations(destinations.filter(dest => dest !== value));
      setDestinationCoordinates(destinationCoordinates.filter(coord => coord[0] !== destinationCoords[0] || coord[1] !== destinationCoords[1]));
    } else {
      // Add the selected destination and its coordinates
      setDestinations([...destinations, value]);
      setDestinationCoordinates([...destinationCoordinates, destinationCoords]);
    }
  };

  return (
    <form className="event-booking-form">
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
        <label>Service Point:</label>
        <select
          value={selectedServicePoint}
          onChange={(e) => handleServicePointSelection(e.target.value)}
          required
        >
          <option value="">Select a service point</option>
          {servicePoints.map((point, index) => (
            <option key={index} value={point}>
              {point}
            </option>
          ))}
        </select>
      </div>
      <CustomDropdown
        options={destinationOptions}
        selectedOptions={destinations}
        onSelectionChange={handleDestinationChange}
        label="Destination"
      />
      <div className="input-group">
        <label>Car Type:</label>
        <select
          value={selectedCarType}
          onChange={(e) => setSelectedCarType(e.target.value)}
          required
        >
          <option value="">Select a car type</option>
          {carTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Number of Cars:</label>
        <input
          type="number"
          value={numOfCars}
          onChange={(e) => setNumOfCars(parseInt(e.target.value))}
          min={1}
          required
        />
      </div>
      <div className="result">
        Available Cars: {availableCars}
      </div>
      <div className="button-group">
        {deliveryEnabled ? (
          <button type="button" onClick={handleDelivery}>
            Delivery Now
          </button>
        ) : (
          <button type="button" onClick={handleSearch}>
            {scanning ? "Scan Other Locations" : "Check Availability"}
          </button>
        )}
      </div>
      {selectedServicePoint && destinationCoordinates.length > 0 && (
        <>
          {destinations.map((destination, index) => (
            <Marker key={index} position={getCoordinatesOfServicePoint(destination)} icon={NewIcon}>
              <Popup>
                {destination}
              </Popup>
            </Marker>
          ))}
          <Polyline
            positions={[getCoordinatesOfServicePoint(selectedServicePoint), ...destinationCoordinates]}
          />
        </>
      )}
    </form>
  );
};

export default EventBookingForm;
