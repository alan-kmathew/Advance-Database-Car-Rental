import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../../styles/EventBooking.css";
import "leaflet/dist/leaflet.css";
import EventBookingForm from "../eventBooking/EventBookingForm";

function EventBooking({ showForm = true }) {
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
      {showForm && (
        <div className="form-overlay">
          <EventBookingForm />
        </div>
      )}
    </MapContainer>
  );
}

export default EventBooking;