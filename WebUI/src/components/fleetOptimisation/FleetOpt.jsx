import React, { useState } from 'react';
import FleetOptForm from './FleetForm';
import "../../styles/FleetOpt.css";
import FleetOptDetails from './FleetOptDetails';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const NewIcon = L.icon({
  iconUrl: require("../../Assets/dest.png"),
  iconSize: [40, 40],
});


function FleetOpt() {
  const [serviceStations, setServiceStations] = useState([]);

  return (
    <div className="fleet-opt-container">
      <FleetOptForm setServiceStations={setServiceStations} />
      <MapContainer center={[49.4875, 8.466]} zoom={7} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {serviceStations.map((station, index) => (
          <Marker key={index} position={[station.latitude, station.longitude]} icon={NewIcon}>
            <Popup>
            <FleetOptDetails
                servicePointName={station.servicePointName}
                totalBookings={station.totalBookings}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FleetOpt;
