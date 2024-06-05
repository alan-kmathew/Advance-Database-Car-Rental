import React, { useState, useEffect } from 'react';

const FormComponent = ({ locations, onLocationChange, enableSharing, selectedLocation, fromDate, setFromDate, toDate, setToDate, destination, setDestination, onSearch }) => {
  const [selectedLocationName, setSelectedLocationName] = useState('');

  useEffect(() => {
    if (selectedLocation) {
      setSelectedLocationName(selectedLocation.name);
    }
  }, [selectedLocation]);

  const handleLocationChange = (e) => {
    const locationName = e.target.value;
    setSelectedLocationName(locationName);
    const location = locations.find(loc => loc.name === locationName);
    onLocationChange(location);
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="form-container">
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
            value={selectedLocationName}
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
    </div>
  );
};

export default FormComponent;
