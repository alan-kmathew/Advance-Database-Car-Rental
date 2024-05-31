// SearchEngine.jsx
import React, { useState } from 'react';
import MapWrapper from '../MapComponent';
import FormComponent from '../FormComponent';
import '../../styles/searchEngine.css'; // Ensure this CSS file exists and is correctly referenced

const locations = [
  { name: 'Berlin', coordinates: [52.52, 13.4050] },
  { name: 'Nuremberg', coordinates: [49.4521, 11.0767] },
  { name: 'Hamburg', coordinates: [53.5511, 9.9937] },
  { name: 'Heidelberg', coordinates: [49.3988, 8.6724] },
  { name: 'Mannheim', coordinates: [49.4875, 8.4660] },
];

const SearchEngine = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [enableSharing, setEnableSharing] = useState(false);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleToggleChange = () => {
    setEnableSharing(!enableSharing);
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
      <MapWrapper selectedLocation={selectedLocation} />
      <FormComponent
        locations={locations}
        onLocationChange={handleLocationChange}
        enableSharing={enableSharing}
      />
    </div>
  );
};

export default SearchEngine;
