// PassengerMapWrapper.jsx
import React from 'react';
import { MapContainer } from 'react-leaflet';
import PassengerMapComponent from './PassengerMapComponent';

const PassengerMapWrapper = ({ markers, onBookNow }) => {
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <PassengerMapComponent markers={markers} onBookNow={onBookNow} />
    </MapContainer>
  );
};

export default PassengerMapWrapper;
