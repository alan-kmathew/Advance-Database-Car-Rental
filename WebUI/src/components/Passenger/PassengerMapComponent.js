// PassengerMapComponent.jsx
import React, { useEffect } from 'react';
import { TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PassengerMapComponent = ({ markers, onBookNow }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const [firstMarker] = markers;
      const coordinates = firstMarker.coordinates.split(',').map(coord => parseFloat(coord));
      map.setView(coordinates, 12);
    }
  }, [markers, map]);

  const handleBookNowClick = (carId) => {
    onBookNow(carId);
  };
console.log("markers------------->",markers);
  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map(marker => (
        <Marker 
          key={marker._id} 
          position={marker.coordinates.split(',').map(coord => parseFloat(coord))}
        >
          <Popup>
            <div className='popup'>
              <h1 className='header'>{marker.carDetails.model}</h1>
              <img src={marker.carDetails.image} alt={marker.carDetails.model} style={{ width: '100px' }} />
              <p>Type: {marker.carDetails.type}</p>
              <p>Seats Available: {marker.carDetails.seats}</p>
              <button className="btn-success" onClick={() => handleBookNowClick(marker.carId)}>Book now</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default PassengerMapComponent;
