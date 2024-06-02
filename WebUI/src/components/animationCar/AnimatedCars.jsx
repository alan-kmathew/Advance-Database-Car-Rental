// import React, { useEffect, useState } from 'react';
// import { Marker, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import carIcon from '../../Assets/car-icon.jpg'; // Replace with the path to your car icon

// const carMarker = new L.Icon({
//   iconUrl: carIcon,
//   iconSize: [32, 32], // Adjust icon size
// });

// const AnimatedCars = ({ positions }) => {
//   const [currentPosition, setCurrentPosition] = useState(positions[0]);
//   const [nextIndex, setNextIndex] = useState(1);
//   const map = useMap();

//   useEffect(() => {
//     if (nextIndex < positions.length) {
//       const interval = setInterval(() => {
//         setCurrentPosition((prevPosition) => {
//           const nextPosition = positions[nextIndex];
//           setNextIndex((prevIndex) => prevIndex + 1);
//           map.setView(nextPosition, map.getZoom()); // Center the map on the next position
//           return nextPosition;
//         });
//       }, 1000); // Adjust the interval duration as needed

//       return () => clearInterval(interval);
//     }
//   }, [nextIndex, positions, map]);

//   return <Marker position={currentPosition} icon={carMarker} />;
// };

// export default AnimatedCars;
