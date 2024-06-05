import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapWrapper from '../MapComponent';
import FormComponent from '../FormComponent';
import Modal from './modal';
import '../../styles/searchEngine.css'; // Ensure this CSS file exists and is correctly referenced

const SearchEngine = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [enableSharing, setEnableSharing] = useState(false);
  const [locations, setLocations] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [destination, setDestination] = useState('');
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:8020/api/car/get/servicePoints');
        const data = response.data.map(location => ({
          id: location._id,
          name: location.name,
          coordinates: location.coordinates.split(',').map(coord => parseFloat(coord)),
          image: location.image,
          totalCars: location.totalCars,
          cars: []
        }));
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleToggleChange = () => {
    setEnableSharing(!enableSharing);
  };

  const handleSearch = async () => {
    if (!selectedLocation || !fromDate || !toDate || (enableSharing && !destination)) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8020/api/car/get/carRental?fromLocation=${selectedLocation.id}&startDate=${fromDate}&endDate=${toDate}`);
      setCars(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching car rental data:', error);
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
        <span className='txt'>Enable Sharing Service</span>
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
      />
      <FormComponent
        locations={locations}
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
          {cars.map(car => (
            <div key={car._id} className="car-item">
              <img src={car.image} alt={car.model} />
              <div className="car-item-details">
                <p>Model: {car.model}</p>
                <p>Price: ${car.price.toFixed(2)}</p>
                <p>Color: {car.color}</p>
                <button onClick={() => alert('Booking functionality not implemented yet')}>Book</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default SearchEngine;
