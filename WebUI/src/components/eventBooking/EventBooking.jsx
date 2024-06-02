import React from "react";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import "../../styles/EventBooking.css";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import EventBookingForm from "../eventBooking/EventBookingForm"; 

function EventBooking() {
  // Markers for the Location
  const markers = [
    { position: [49.4875, 8.466], popup: "Mannheim, Germany - Central Point" },
    { position: [52.52, 13.405], popup: "Berlin, Germany - Capital" },
    { position: [53.5511, 9.9937], popup: "Hamburg, Germany" },
    { position: [50.1109, 8.6821], popup: "Frankfurt, Germany" },
    { position: [51.0504, 13.7373], popup: "Dresden, Germany" },
    { position: [48.7758, 9.1829], popup: "Stuttgart, Germany" },
    { position: [51.3397, 12.3731], popup: "Leipzig, Germany" },
    { position: [49.4094, 8.6931], popup: "Heidelberg, Germany" },
    { position: [49.54, 8.5783], popup: "Ludwigshafen, Germany" },
  ];
  const NewIcon = new Icon({
    iconUrl: require("../../Assets/loc-icon.png"),
    iconSize: [38, 38],
  });
  return (
    <MapContainer
      center={[49.4875, 8.466]}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: "100%", position: "relative" }} 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.position} icon={NewIcon}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
      <div className="form-overlay">
        <EventBookingForm />
      </div>
    </MapContainer>
  );
}

export default EventBooking;

