import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import L from 'leaflet';
import '../styles/MapComponent.css';

// Fix the default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ locations, selectedLocation, onLocationChange, fromDate, toDate, destination, enableSharing, onSearch }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation.coordinates, 12);
    }
  }, [selectedLocation, map]);

  const handleMarkerClick = (location) => {
    onLocationChange(location);
  };

  const handleBookNowClick = () => {
    if (!fromDate || !toDate || (enableSharing && !destination)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required fields.',
        icon: 'error',
        position: 'bottom-end', 
        showConfirmButton: false,
        timer: 3000, 
        toast: true, 
      });
      return;
    }
    onSearch();
  };

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map(location => (
        <Marker 
          key={location.id} 
          position={location.coordinates}
          eventHandlers={{
            click: () => handleMarkerClick(location)
          }}
        >
          <Popup>
            <div className='popup'>
              <h1 className='header'>{location.name}</h1>
              <img src={location.image} alt={location.name} />
              <p>Total Cars: {location.totalCars}</p>
              <button className="btn-success" onClick={handleBookNowClick}>Book now</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapWrapper = ({ locations, selectedLocation, onLocationChange, fromDate, toDate, destination, enableSharing, onSearch }) => {
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <MapComponent 
        locations={locations} 
        selectedLocation={selectedLocation} 
        onLocationChange={onLocationChange} 
        fromDate={fromDate} 
        toDate={toDate} 
        destination={destination} 
        enableSharing={enableSharing} 
        onSearch={onSearch} 
      />
    </MapContainer>
  );
};

export default MapWrapper;
