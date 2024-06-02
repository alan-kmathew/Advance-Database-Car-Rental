// // MapAdmin.jsx
// import React from "react";
// import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
// import { Icon } from "leaflet";

// const MapAdmin = ({ markers }) => {
//   const NewIcon = new Icon({
//     iconUrl: require("../../Assets/loc-icon.png"),
//     iconSize: [38, 38],
//   });

//   return (
//     <MapContainer
//       center={[49.4875, 8.466]}
//       zoom={6}
//       scrollWheelZoom={false}
//       style={{ height: "100%", position: "relative" }}
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       {markers.map((marker, idx) => (
//         <Marker key={idx} position={marker.position} icon={NewIcon}>
//           <Popup>{marker.popup}</Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default MapAdmin;
