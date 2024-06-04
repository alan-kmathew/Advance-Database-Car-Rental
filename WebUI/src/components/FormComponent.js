import React, { useState } from 'react';

const FormComponent = ({ locations, onLocationChange, enableSharing }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const location = locations.find(loc => loc.name === selectedLocation);
    // You can still handle form submit if needed
  };

  const handleLocationChange = (e) => {
    const locationName = e.target.value;
    setSelectedLocation(locationName);
    const location = locations.find(loc => loc.name === locationName);
    onLocationChange(location);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
 
    {!enableSharing && ( 
      <div>
        <label>From Date:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
        />
      </div>
    )}
    {!enableSharing && ( 
      <div>
        <label>To Date:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />
      </div>
    )}
      <div>
        <label>Location:</label>
        <select
          value={selectedLocation}
          onChange={handleLocationChange}
          required
        >
          <option value="">Select a location</option>
          {locations.map((location, index) => (
            <option key={index} value={location.name}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
      {enableSharing && (
        <div>
          <label>Destination:</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required={enableSharing}
          />
        </div>
      )}
      <button type="submit">Search</button>
    </form>
  );
};

export default FormComponent;
