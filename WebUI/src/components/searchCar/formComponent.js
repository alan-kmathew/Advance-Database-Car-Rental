import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const FormComponent = ({ locations, allLocations, onLocationChange, enableSharing, selectedLocation, fromDate, setFromDate, toDate, setToDate, destination, setDestination, onSearch }) => {
  const [selectedLocationName, setSelectedLocationName] = useState('');

  useEffect(() => {
    if (selectedLocation) {
      setSelectedLocationName(selectedLocation.name);
    }
  }, [selectedLocation]);

  const handleLocationChange = (selectedOption) => {
    if (selectedOption === null) {
      setSelectedLocationName('');
      onLocationChange(null);
    } else {
      setSelectedLocationName(selectedOption.value);
      const location = locations.find(loc => loc.name === selectedOption.value);
      onLocationChange(location);
    }
  };

  const handleDestinationChange = (selectedOption) => {
    setDestination(selectedOption ? selectedOption.value : '');
  };

  const locationOptions = locations.map((location) => ({
    value: location.name,
    label: location.name
  }));

  const destinationOptions = allLocations.map((location) => ({
    value: location.name,
    label: location.name
  }));

  return (
    <div className="search-form">
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
          <Select
            options={locationOptions}
            value={locationOptions.find(option => option.value === selectedLocationName)}
            onChange={handleLocationChange}
            isClearable
            classNamePrefix="react-select"
          />
        </div>
        {enableSharing && (
          <div>
            <label>Destination:</label>
            <Select
              options={destinationOptions}
              value={destinationOptions.find(option => option.value === destination)}
              onChange={handleDestinationChange}
              isClearable
              classNamePrefix="react-select"
            />
          </div>
        )}
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default FormComponent;
