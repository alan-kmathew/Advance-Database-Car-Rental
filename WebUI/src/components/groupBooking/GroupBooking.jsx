import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./GroupBooking.css";
import GroupBookingForm from "./Form/GroupBookingForm";
import { useState } from "react";
const GroupBooking = () => {
  const [plan, setPlan] = useState({});
  return (
    <>
      <GroupBookingForm setPlan={setPlan} />
      <MapContainer
        center={[49.4875, 8.466]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", position: "relative" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(plan).map((planItem, index) => {
          return (
            <Marker
              position={[planItem[1].location.lat, planItem[1].location.lon]}
              eventHandlers={{
                click: (e) => {
                  console.log("marker clicked", e);
                },
              }}
            ></Marker>
          );
        })}
      </MapContainer>
    </>
  );
};

export default GroupBooking;
