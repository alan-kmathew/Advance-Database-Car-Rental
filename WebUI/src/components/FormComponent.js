import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const FormComponent = ({ locations, allLocations, onLocationChange, enableSharing, selectedLocation, fromDate, setFromDate, toDate, setToDate, destination, setDestination, onSearch }) => {
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

  const handleDestinationChange = (selectedOption) => {
    setDestination(selectedOption ? selectedOption.value : '');
  };

  const destinationOptions = allLocations.map((location) => ({
    value: location.name,
    label: location.name
  }));

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="form-container">
        <div>
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>
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
            <Select
              options={destinationOptions}
              value={destinationOptions.find(option => option.value === destination)}
              onChange={handleDestinationChange}
              isClearable
            />
          </div>
        )}
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default FormComponent;
