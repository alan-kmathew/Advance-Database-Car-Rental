// Working API
// import React, { useState, useEffect } from 'react';
// import { useMap, Marker, Popup } from 'react-leaflet';
// import L from "leaflet";
// import CustomDropdown from './CustomDropdownEvent';
// import "../../styles/EventbookingForm.css";
// import axios from 'axios';

// const IconDest = L.icon({
//   iconUrl: require("../../Assets/Service.png"),
//   iconSize: [38, 38],
// });

//  const NewIcon = L.icon({
//     iconUrl: require("../../Assets/dest.png"),
//     iconSize: [40, 40],
//   });

// const EventDetails = ({ cityName, totalAvailableCars, distance }) => {
//   return (
//     <div>
//       <h3>{cityName}</h3>
//       <p>Total Available Cars: {totalAvailableCars === null ? "Loading..." : totalAvailableCars}</p>
//       {distance !== undefined && <p>Distance: {distance.toFixed(1)} miles</p>}
//     </div>
//   );
// };

// const EventBookingForm = () => {
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedServicePoint, setSelectedServicePoint] = useState('');
//   const [destinations, setDestinations] = useState([]);
//   const [selectedCarType, setSelectedCarType] = useState('');
//   const [numOfCars, setNumOfCars] = useState(1);
//   const [availableCars, setAvailableCars] = useState(null);
//   const [remainingCars, setRemainingCars] = useState(0);
//   const [servicePoints, setServicePoints] = useState([]);
//   const [nearestServiceStations, setNearestServiceStations] = useState([]);

//   const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback", "Convertible", "Wagon", "Coupe", "Muscle"];
//   const destinationOptions = ["Berlin", "Dortmund", "Munich", "Leipzig"];

//   const map = useMap();

//   useEffect(() => {
//     fetchServicePoints();
//   }, []);

//   const fetchServicePoints = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/servicePoints');
//       const servicePointOptions = response.data.map((servicePoint) => ({
//         value: servicePoint.name,
//         label: servicePoint.name,
//         coordinates: servicePoint.coordinates.split(',').map(coord => parseFloat(coord.trim()))
//       }));
//       setServicePoints(servicePointOptions);
//     } catch (error) {
//       console.error('Error fetching service points:', error);
//     }
//   };

//   useEffect(() => {
//     if (selectedServicePoint) {
//       const servicePointCoordinates = getCoordinatesOfServicePoint(selectedServicePoint);
//       map.setView(servicePointCoordinates, 6);
//     } else {
//       map.setView([51.1657, 10.4515], 6); // Default view of Germany
//     }
//   }, [selectedServicePoint, map]);

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//         params: {
//           servicePointName: selectedServicePoint,
//           carCategory: selectedCarType,
//         },
//       });
//       const available = response.data.totalCarsAvailable;
//       setAvailableCars(available);

//       if (numOfCars <= available) {
//         setRemainingCars(0);
//       } else {
//         setRemainingCars(numOfCars - available);
//       }
//     } catch (error) {
//       console.error('Error fetching available cars:', error);
//     }
//   };

//   const handleDelivery = () => {
//     alert("Delivery initiated!");
//   };

//   const handleScanAgain = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/nearest/servicestation', {
//         params: {
//           cityName: selectedServicePoint,
//         },
//       });
//       const nearestStations = response.data;

//       if (!Array.isArray(nearestStations) || nearestStations.length === 0) {
//         throw new Error('No nearby service stations found');
//       }

//       const topThreeStations = nearestStations.slice(0, 3);
//       setNearestServiceStations(topThreeStations);

//       let totalAvailableAtNearest = 0;
//       let stillNeeded = remainingCars;

//       for (const station of topThreeStations) {
//         if (!station.locatedInCity || !station.latitude || !station.longitude) {
//           console.error('Invalid station data:', station);
//           continue;
//         }

//         const carsResponse = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//           params: {
//             servicePointName: station.locatedInCity,
//             carCategory: selectedCarType,
//           },
//         });
//         const availableAtStation = carsResponse.data.totalCarsAvailable;
//         totalAvailableAtNearest += availableAtStation;
//         stillNeeded = Math.max(0, stillNeeded - availableAtStation);

//         if (stillNeeded === 0) break;
//       }

//       setRemainingCars(stillNeeded);
//       if (stillNeeded === 0) {
//         alert(`Found all ${remainingCars} ${selectedCarType}(s) at nearby stations.`);
//       } else {
//         alert(`Found ${totalAvailableAtNearest} ${selectedCarType}(s) at nearby stations. Still need ${stillNeeded} more.`);
//       }

//       // Set the map view to the first nearest station
//       const firstStation = topThreeStations[0];
//       map.setView([firstStation.latitude, firstStation.longitude], 10);
//     } catch (error) {
//       console.error('Error scanning other locations:', error);
//       setNearestServiceStations([]);
//       map.setView(getCoordinatesOfServicePoint(selectedServicePoint), 12); // Reset to the current service point
//       alert('Failed to find suitable nearby service stations. Please try again or contact support.');
//     }
//   };

//   const handleServicePointSelection = (point) => {
//     setSelectedServicePoint(point);
//     setAvailableCars(null);
//     setRemainingCars(0);
//     setNearestServiceStations([]);
//     const servicePointCoordinates = getCoordinatesOfServicePoint(point);
//     map.setView(servicePointCoordinates, 12);
//   };

//   const getCoordinatesOfServicePoint = (point) => {
//     const servicePoint = servicePoints.find(sp => sp.value === point);
//     return servicePoint ? servicePoint.coordinates : [0, 0];
//   };

//   const handleDestinationChange = (value) => {
//     if (destinations.includes(value)) {
//       setDestinations(destinations.filter(dest => dest !== value));
//     } else {
//       setDestinations([...destinations, value]);
//     }
//   };

//   return (
//     <form className="event-booking-form">
//       <div className="input-group">
//         <label>From Date:</label>
//         <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>To Date:</label>
//         <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>Service Point:</label>
//         <select value={selectedServicePoint} onChange={(e) => handleServicePointSelection(e.target.value)} required>
//           <option value="">Select a service point</option>
//           {servicePoints.map((option, index) => (
//             <option key={index} value={option.value}>{option.label}</option>
//           ))}
//         </select>
//       </div>
//       <CustomDropdown
//         options={destinationOptions}
//         selectedOptions={destinations}
//         onSelectionChange={handleDestinationChange}
//         label="Destination"
//       />
//       <div className="input-group">
//         <label>Car Type:</label>
//         <select
//           value={selectedCarType}
//           onChange={(e) => {
//             setSelectedCarType(e.target.value);
//             setAvailableCars(null);
//             setRemainingCars(0);
//           }}
//           required
//         >
//           <option value="">Select a car type</option>
//           {carTypes.map((type, index) => (
//             <option key={index} value={type}>{type}</option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Number of Cars:</label>
//         <input
//           type="number"
//           value={numOfCars}
//           onChange={(e) => setNumOfCars(parseInt(e.target.value))}
//           min={1}
//           required
//         />
//       </div>
//       <div className="result">
//         {availableCars !== null && (
//           <>
//             <p>Available Cars: {availableCars}</p>
//             {remainingCars > 0 && <p>Cars Still Needed: {remainingCars}</p>}
//           </>
//         )}
//       </div>
//       <div className="button-group">
//         {availableCars === null ? (
//           <button type="button" onClick={handleSearch}>
//             Check Availability
//           </button>
//         ) : (
//           <>
//             {remainingCars === 0 ? (
//               <button type="button" onClick={handleDelivery}>
//                 Delivery Now
//               </button>
//             ) : (
//               <button type="button" onClick={handleScanAgain}>
//                 Scan Other Locations
//               </button>
//             )}
//           </>
//         )}
//       </div>
//       {selectedServicePoint && (
//         <Marker position={getCoordinatesOfServicePoint(selectedServicePoint)} icon={IconDest}>
//           <Popup>
//             <EventDetails cityName={selectedServicePoint} totalAvailableCars={availableCars} />
//           </Popup>
//         </Marker>
//       )}
//       {nearestServiceStations.map((station, index) => (
//         <Marker 
//           key={index}
//           position={[station.latitude, station.longitude]} 
//           icon={NewIcon}
//         >
//           <Popup>
//             <EventDetails 
//               cityName={station.locatedInCity || "Unknown Station"} 
//               totalAvailableCars={availableCars === null ? "Loading..." : availableCars}
//               distance={station.distanceInMiles} 
//             />
//           </Popup>
//         </Marker>
//       ))}
//     </form>
//   );
// };

// export default EventBookingForm;






// import React, { useState, useEffect } from 'react';
// import { useMap, Marker, Popup } from 'react-leaflet';
// import L from "leaflet";
// import axios from 'axios';
// import Select from 'react-select';
// import "../../styles/EventbookingForm.css";

// const IconDest = L.icon({
//   iconUrl: require("../../Assets/Service.png"),
//   iconSize: [38, 38],
// });

// const NewIcon = L.icon({
//   iconUrl: require("../../Assets/dest.png"),
//   iconSize: [40, 40],
// });

// const EventDetails = ({ cityName, totalAvailableCars, distance }) => {
//   return (
//     <div>
//       <h3>{cityName}</h3>
//       <p>Total Available Cars: {totalAvailableCars === null ? "Loading..." : totalAvailableCars}</p>
//       {distance !== undefined && <p>Distance: {distance.toFixed(1)} miles</p>}
//     </div>
//   );
// };

// const EventBookingForm = () => {
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedServicePoint, setSelectedServicePoint] = useState('');
//   const [destinations, setDestinations] = useState([]);
//   const [selectedCarType, setSelectedCarType] = useState('');
//   const [numOfCars, setNumOfCars] = useState(1);
//   const [availableCars, setAvailableCars] = useState(null);
//   const [remainingCars, setRemainingCars] = useState(0);
//   const [servicePoints, setServicePoints] = useState([]);
//   const [nearestServiceStations, setNearestServiceStations] = useState([]);

//   const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback", "Convertible", "Wagon", "Coupe", "Muscle"];
//   const destinationOptions = [
//     { value: "Berlin", label: "Berlin" },
//     { value: "Dortmund", label: "Dortmund" },
//     { value: "Munich", label: "Munich" },
//     { value: "Leipzig", label: "Leipzig" }
//   ];

//   const map = useMap();

//   useEffect(() => {
//     fetchServicePoints();
//   }, []);

//   const fetchServicePoints = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/servicePoints');
//       const servicePointOptions = response.data.map((servicePoint) => ({
//         value: servicePoint.name,
//         label: servicePoint.name,
//         coordinates: servicePoint.coordinates.split(',').map(coord => parseFloat(coord.trim()))
//       }));
//       setServicePoints(servicePointOptions);
//     } catch (error) {
//       console.error('Error fetching service points:', error);
//     }
//   };

//   useEffect(() => {
//     if (selectedServicePoint) {
//       const servicePointCoordinates = getCoordinatesOfServicePoint(selectedServicePoint);
//       map.setView(servicePointCoordinates, 6.5);
//     } else {
//       map.setView([51.1657, 10.4515], 6); // Default view of Germany
//     }
//   }, [selectedServicePoint, map]);

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//         params: {
//           servicePointName: selectedServicePoint,
//           carCategory: selectedCarType,
//         },
//       });
//       const available = response.data.totalCarsAvailable;
//       setAvailableCars(available);

//       if (numOfCars <= available) {
//         setRemainingCars(0);
//       } else {
//         setRemainingCars(numOfCars - available);
//       }
//     } catch (error) {
//       console.error('Error fetching available cars:', error);
//     }
//   };

//   const handleDelivery = () => {
//     alert("Delivery initiated!");
//   };

//   const handleScanAgain = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/nearest/servicestation', {
//         params: {
//           cityName: selectedServicePoint,
//         },
//       });
  
//       const nearestStations = response.data;
  
//       if (!Array.isArray(nearestStations) || nearestStations.length === 0) {
//         throw new Error('Invalid response format: Expected an array of nearest service stations');
//       }
  
//       setNearestServiceStations(nearestStations);
  
//       let totalAvailableAtNearest = 0;
//       let stillNeeded = remainingCars;
  
//       for (const station of nearestStations) {
//         if (!station.locatedInCity || !station.latitude || !station.longitude) {
//           console.error('Invalid station data:', station);
//           continue;
//         }
  
//         try {
//           const carsResponse = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//             params: {
//               servicePointName: station.locatedInCity,
//               carCategory: selectedCarType,
//             },
//           });
  
//           const availableAtStation = carsResponse.data.totalCarsAvailable;
//           totalAvailableAtNearest += availableAtStation;
//           stillNeeded = Math.max(0, stillNeeded - availableAtStation);
  
//           if (stillNeeded === 0) break;
//         } catch (error) {
//           console.error('Error fetching available cars for station:', station, error);
//         }
//       }
  
//       setRemainingCars(stillNeeded);
//     } catch (error) {
//       console.error('Error scanning other locations:', error);
//       setNearestServiceStations([]);
//       alert('Failed to fetch nearest service stations. Please try again or contact support.');
//     }
//   };

//   const handleServicePointSelection = (point) => {
//     setSelectedServicePoint(point);
//     setAvailableCars(null);
//     setRemainingCars(0);
//     setNearestServiceStations([]);
//     const servicePointCoordinates = getCoordinatesOfServicePoint(point);
//     map.setView(servicePointCoordinates, 12);
//   };

//   const getCoordinatesOfServicePoint = (point) => {
//     const servicePoint = servicePoints.find(sp => sp.value === point);
//     return servicePoint ? servicePoint.coordinates : [0, 0];
//   };

//   const handleDestinationChange = (selectedOptions) => {
//     setDestinations(selectedOptions.map(option => option.value));
//   };

//   return (
//     <form className="event-booking-form">
//       <div className="input-group">
//         <label>From Date:</label>
//         <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>To Date:</label>
//         <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>Service Point:</label>
//         <select value={selectedServicePoint} onChange={(e) => handleServicePointSelection(e.target.value)} required>
//           <option value="">Select a service point</option>
//           {servicePoints.map((option, index) => (
//             <option key={index} value={option.value}>{option.label}</option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Destination:</label>
//         <Select
//           isMulti
//           value={destinationOptions.filter(option => destinations.includes(option.value))}
//           onChange={handleDestinationChange}
//           options={destinationOptions}
//           placeholder="Select destinations"
//         />
//       </div>
//       <div className="input-group">
//         <label>Car Type:</label>
//         <select
//           value={selectedCarType}
//           onChange={(e) => {
//             setSelectedCarType(e.target.value);
//             setAvailableCars(null);
//             setRemainingCars(0);
//           }}
//           required
//         >
//           <option value="">Select a car type</option>
//           {carTypes.map((type, index) => (
//             <option key={index} value={type}>{type}</option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Number of Cars:</label>
//         <input
//           type="number"
//           value={numOfCars}
//           onChange={(e) => setNumOfCars(parseInt(e.target.value))}
//           min={1}
//           required
//         />
//       </div>
//       <div className="result">
//         {availableCars !== null && (
//           <>
//             <p>Available Cars: {availableCars}</p>
//             {remainingCars > 0 && <p>Cars Still Needed: {remainingCars}</p>}
//           </>
//         )}
//       </div>
//       <div className="button-group">
//         {availableCars === null ? (
//           <button type="button" onClick={handleSearch}>
//             Check Availability
//           </button>
//         ) : (
//           <>
//             {remainingCars === 0 ? (
//               <button type="button" onClick={handleDelivery}>
//                 Delivery Now
//               </button>
//             ) : (
//               <button type="button" onClick={handleScanAgain}>
//                 Scan Other Locations
//               </button>
//             )}
//           </>
//         )}
//       </div>
//       {selectedServicePoint && (
//         <>
//           <Marker position={getCoordinatesOfServicePoint(selectedServicePoint)} icon={IconDest}>
//             <Popup>
//               <EventDetails cityName={selectedServicePoint} totalAvailableCars={availableCars} />
//             </Popup>
//           </Marker>
//           {nearestServiceStations.map((station, index) => (
//             <Marker
//               key={index}
//               position={[station.latitude, station.longitude]}
//               icon={NewIcon}
//             >
//               <Popup>
//                 <EventDetails
//                   cityName={station.locatedInCity || "Unknown Station"}
//                   totalAvailableCars={availableCars === null ? "Loading..." : availableCars}
//                   distance={station.distanceInMiles}
//                 />
//               </Popup>
//             </Marker>
//           ))}
//         </>
//       )}
//     </form>
//   );
// };

// export default EventBookingForm;


// import React, { useState, useEffect } from 'react';
// import { useMap, Marker, Popup } from 'react-leaflet';
// import L from "leaflet";
// import axios from 'axios';
// import Select from 'react-select';
// import "../../styles/EventbookingForm.css";

// const IconDest = L.icon({
//   iconUrl: require("../../Assets/Service.png"),
//   iconSize: [38, 38],
// });

// const NewIcon = L.icon({
//   iconUrl: require("../../Assets/dest.png"),
//   iconSize: [40, 40],
// });

// const EventDetails = ({ cityName, totalAvailableCars, distance }) => {
//   return (
//     <div>
//       <h3>{cityName}</h3>
//       <p>Total Available Cars: {totalAvailableCars === null ? "Loading..." : totalAvailableCars}</p>
//       {distance !== undefined && <p>Distance: {distance.toFixed(1)} miles</p>}
//     </div>
//   );
// };

// const EventBookingForm = () => {
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedServicePoint, setSelectedServicePoint] = useState('');
//   const [destinations, setDestinations] = useState([]);
//   const [selectedCarType, setSelectedCarType] = useState('');
//   const [numOfCars, setNumOfCars] = useState(1);
//   const [availableCars, setAvailableCars] = useState(null);
//   const [remainingCars, setRemainingCars] = useState(0);
//   const [servicePoints, setServicePoints] = useState([]);
//   const [nearestServiceStations, setNearestServiceStations] = useState([]);

//   const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback", "Convertible", "Wagon", "Coupe", "Muscle"];
//   const destinationOptions = [
//     { value: "Berlin", label: "Berlin" },
//     { value: "Dortmund", label: "Dortmund" },
//     { value: "Munich", label: "Munich" },
//     { value: "Leipzig", label: "Leipzig" }
//   ];

//   const map = useMap();

//   useEffect(() => {
//     fetchServicePoints();
//   }, []);

//   const fetchServicePoints = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/servicePoints');
//       const servicePointOptions = response.data.map((servicePoint) => ({
//         value: servicePoint.name,
//         label: servicePoint.name,
//         coordinates: servicePoint.coordinates.split(',').map(coord => parseFloat(coord.trim()))
//       }));
//       setServicePoints(servicePointOptions);
//     } catch (error) {
//       console.error('Error fetching service points:', error);
//     }
//   };

//   useEffect(() => {
//     if (selectedServicePoint) {
//       const servicePointCoordinates = getCoordinatesOfServicePoint(selectedServicePoint);
//       map.setView(servicePointCoordinates, 6.5);
//     } else {
//       map.setView([51.1657, 10.4515], 6); // Default view of Germany
//     }
//   }, [selectedServicePoint, map]);

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//         params: {
//           servicePointName: selectedServicePoint,
//           carCategory: selectedCarType,
//         },
//       });
//       const available = response.data.totalCarsAvailable;
//       setAvailableCars(available);

//       if (numOfCars <= available) {
//         setRemainingCars(0);
//       } else {
//         setRemainingCars(numOfCars - available);
//       }
//     } catch (error) {
//       console.error('Error fetching available cars:', error);
//     }
//   };

//   const handleDelivery = () => {
//     alert("Delivery initiated!");
//   };

//   const handleScanAgain = async () => {
//     try {
//       const response = await axios.get('http://localhost:8020/api/car/get/nearest/servicestation', {
//         params: {
//           cityName: selectedServicePoint,
//         },
//       });
  
//       const nearestStations = response.data;
  
//       if (!Array.isArray(nearestStations) || nearestStations.length === 0) {
//         throw new Error('Invalid response format: Expected an array of nearest service stations');
//       }
  
//       // Filter out the first result as it represents the current city
//       const filteredStations = nearestStations.slice(1);
  
//       setNearestServiceStations(filteredStations);
  
//       let totalAvailableAtNearest = 0;
//       let stillNeeded = remainingCars;
  
//       for (const station of filteredStations) {
//         if (!station.locatedInCity || !station.latitude || !station.longitude) {
//           console.error('Invalid station data:', station);
//           continue;
//         }
  
//         try {
//           const carsResponse = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//             params: {
//               servicePointName: station.locatedInCity,
//               carCategory: selectedCarType,
//             },
//           });
  
//           const availableAtStation = carsResponse.data.totalCarsAvailable;
//           totalAvailableAtNearest += availableAtStation;
//           stillNeeded = Math.max(0, stillNeeded - availableAtStation);
  
//           if (stillNeeded === 0) break;
//         } catch (error) {
//           console.error('Error fetching available cars for station:', station, error);
//         }
//       }
  
//       setRemainingCars(stillNeeded);
//     } catch (error) {
//       console.error('Error scanning other locations:', error);
//       setNearestServiceStations([]);
//       alert('Failed to fetch nearest service stations. Please try again or contact support.');
//     }
//   };

//   const handleServicePointSelection = (point) => {
//     setSelectedServicePoint(point);
//     setAvailableCars(null);
//     setRemainingCars(0);
//     setNearestServiceStations([]);
//     const servicePointCoordinates = getCoordinatesOfServicePoint(point);
//     map.setView(servicePointCoordinates, 12);
//   };

//   const getCoordinatesOfServicePoint = (point) => {
//     const servicePoint = servicePoints.find(sp => sp.value === point);
//     return servicePoint ? servicePoint.coordinates : [0, 0];
//   };

//   const handleDestinationChange = (selectedOptions) => {
//     setDestinations(selectedOptions.map(option => option.value));
//   };

//   return (
//     <form className="event-booking-form">
//       <div className="input-group">
//         <label>From Date:</label>
//         <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>To Date:</label>
//         <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
//       </div>
//       <div className="input-group">
//         <label>Service Point:</label>
//         <select value={selectedServicePoint} onChange={(e) => handleServicePointSelection(e.target.value)} required>
//           <option value="">Select a service point</option>
//           {servicePoints.map((option, index) => (
//             <option key={index} value={option.value}>{option.label}</option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Destination:</label>
//         <Select
//           isMulti
//           value={destinationOptions.filter(option => destinations.includes(option.value))}
//           onChange={handleDestinationChange}
//           options={destinationOptions}
//           placeholder="Select destinations"
//         />
//       </div>
//       <div className="input-group">
//         <label>Car Type:</label>
//         <select
//           value={selectedCarType}
//           onChange={(e) => {
//             setSelectedCarType(e.target.value);
//             setAvailableCars(null);
//             setRemainingCars(0);
//           }}
//           required
//         >
//           <option value="">Select a car type</option>
//           {carTypes.map((type, index) => (
//             <option key={index} value={type}>{type}</option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Number of Cars:</label>
//         <input
//           type="number"
//           value={numOfCars}
//           onChange={(e) => setNumOfCars(parseInt(e.target.value))}
//           min={1}
//           required
//         />
//       </div>
//       <div className="result">
//         {availableCars !== null && (
//           <>
//             <p>Available Cars: {availableCars}</p>
//             {remainingCars > 0 && <p>Cars Still Needed: {remainingCars}</p>}
//           </>
//         )}
//       </div>
//       <div className="button-group">
//         {availableCars === null ? (
//           <button type="button" onClick={handleSearch}>
//             Check Availability
//           </button>
//         ) : (
//           <>
//             {remainingCars === 0 ? (
//               <button type="button" onClick={handleDelivery}>
//                 Delivery Now
//               </button>
//             ) : (
//               <button type="button" onClick={handleScanAgain}>
//                 Scan Other Locations
//               </button>
//             )}
//           </>
//         )}
//       </div>
//       {selectedServicePoint && (
//         <>
//           <Marker position={getCoordinatesOfServicePoint(selectedServicePoint)} icon={IconDest}>
//             <Popup>
//               <EventDetails cityName={selectedServicePoint} totalAvailableCars={availableCars} />
//             </Popup>
//           </Marker>
//           {nearestServiceStations.map((station, index) => (
//             <Marker
//               key={index}
//               position={[station.latitude, station.longitude]}
//               icon={NewIcon}
//             >
//               <Popup>
//                 <EventDetails
//                   cityName={station.locatedInCity || "Unknown Station"}
//                   totalAvailableCars={availableCars === null ? "Loading..." : availableCars}
//                   distance={station.distanceInMiles}
//                 />
//               </Popup>
//             </Marker>
//           ))}
//         </>
//       )}
//     </form>
//   );
// };

// export default EventBookingForm;



import React, { useState, useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import axios from 'axios';
import Select from 'react-select';
import "../../styles/EventbookingForm.css";

const IconDest = L.icon({
  iconUrl: require("../../Assets/Service.png"),
  iconSize: [38, 38],
});

const NewIcon = L.icon({
  iconUrl: require("../../Assets/dest.png"),
  iconSize: [40, 40],
});

const EventDetails = ({ cityName, totalAvailableCars, distance }) => {
  return (
    <div>
      <h3>{cityName}</h3>
      <p>Total Available Cars: {totalAvailableCars === null ? "Loading..." : totalAvailableCars}</p>
      {distance !== undefined && <p>Distance: {distance.toFixed(1)} miles</p>}
    </div>
  );
};

const EventBookingForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedServicePoint, setSelectedServicePoint] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [selectedCarType, setSelectedCarType] = useState('');
  const [numOfCars, setNumOfCars] = useState(1);
  const [availableCars, setAvailableCars] = useState(null);
  const [remainingCars, setRemainingCars] = useState(0);
  const [servicePoints, setServicePoints] = useState([]);
  const [nearestServiceStations, setNearestServiceStations] = useState([]);

  const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback", "Convertible", "Wagon", "Coupe", "Muscle"];
  const destinationOptions = [
    { value: "Berlin", label: "Berlin" },
    { value: "Dortmund", label: "Dortmund" },
    { value: "Munich", label: "Munich" },
    { value: "Leipzig", label: "Leipzig" }
  ];

  const map = useMap();

  useEffect(() => {
    fetchServicePoints();
  }, []);

  const fetchServicePoints = async () => {
    try {
      const response = await axios.get('http://localhost:8020/api/car/get/servicePoints');
      const servicePointOptions = response.data.map((servicePoint) => ({
        value: servicePoint.name,
        label: servicePoint.name,
        coordinates: servicePoint.coordinates.split(',').map(coord => parseFloat(coord.trim()))
      }));
      setServicePoints(servicePointOptions);
    } catch (error) {
      console.error('Error fetching service points:', error);
    }
  };

  useEffect(() => {
    if (selectedServicePoint) {
      const servicePointCoordinates = getCoordinatesOfServicePoint(selectedServicePoint);
      map.setView(servicePointCoordinates, 6.5);
    } else {
      map.setView([51.1657, 10.4515], 6); // Default view of Germany
    }
  }, [selectedServicePoint, map]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8020/api/car/get/cars`, {
        params: {
          servicePointName: selectedServicePoint,
          carCategory: selectedCarType,
        },
      });
      const available = response.data.totalCarsAvailable;
      setAvailableCars(available);

      if (numOfCars <= available) {
        setRemainingCars(0);
      } else {
        setRemainingCars(numOfCars - available);
      }
    } catch (error) {
      console.error('Error fetching available cars:', error);
    }
  };

  const handleDelivery = () => {
    alert("Delivery initiated!");
  };

  const handleScanAgain = async () => {
    try {
      const response = await axios.get('http://localhost:8020/api/car/get/nearest/servicestation', {
        params: {
          cityName: selectedServicePoint,
        },
      });
  
      const nearestStations = response.data;
  
      if (!Array.isArray(nearestStations) || nearestStations.length === 0) {
        throw new Error('Invalid response format: Expected an array of nearest service stations');
      }
  
      // Filter out the first result as it represents the current city
      const filteredStations = nearestStations.slice(1);
  
      setNearestServiceStations(filteredStations);
  
      let totalAvailableAtNearest = 0;
      let stillNeeded = remainingCars;
  
      for (const station of filteredStations) {
        if (!station.locatedInCity || !station.latitude || !station.longitude) {
          console.error('Invalid station data:', station);
          continue;
        }
  
        try {
          const carsResponse = await axios.get(`http://localhost:8020/api/car/get/cars`, {
            params: {
              servicePointName: station.locatedInCity,
              carCategory: selectedCarType,
            },
          });
  
          const availableAtStation = carsResponse.data.totalCarsAvailable;
          totalAvailableAtNearest += availableAtStation;
          stillNeeded = Math.max(0, stillNeeded - availableAtStation);
  
          if (stillNeeded === 0) break;
        } catch (error) {
          console.error('Error fetching available cars for station:', station, error);
        }
      }
  
      setRemainingCars(stillNeeded);
    } catch (error) {
      console.error('Error scanning other locations:', error);
      setNearestServiceStations([]);
      alert('Failed to fetch nearest service stations. Please try again or contact support.');
    }
  };

  const handleServicePointSelection = (point) => {
    setSelectedServicePoint(point);
    setAvailableCars(null);
    setRemainingCars(0);
    setNearestServiceStations([]);
    const servicePointCoordinates = getCoordinatesOfServicePoint(point);
    map.setView(servicePointCoordinates, 12);
  };

  const getCoordinatesOfServicePoint = (point) => {
    const servicePoint = servicePoints.find(sp => sp.value === point);
    return servicePoint ? servicePoint.coordinates : [0, 0];
  };

  const handleDestinationChange = (selectedOptions) => {
    setDestinations(selectedOptions.map(option => option.value));
  };

  return (
    <form className="event-booking-form">
      <div className="input-group">
        <label>From Date:</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>To Date:</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
      </div>
      <div className="input-group">
        <label>Service Point:</label>
        <select value={selectedServicePoint} onChange={(e) => handleServicePointSelection(e.target.value)} required>
          <option value="">Select a service point</option>
          {servicePoints.map((option, index) => (            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Destination:</label>
        <Select
          isMulti
          value={destinationOptions.filter(option => destinations.includes(option.value))}
          onChange={handleDestinationChange}
          options={destinationOptions}
          placeholder="Select destinations"
        />
      </div>
      <div className="input-group">
        <label>Car Type:</label>
        <select
          value={selectedCarType}
          onChange={(e) => {
            setSelectedCarType(e.target.value);
            setAvailableCars(null);
            setRemainingCars(0);
          }}
          required
        >
          <option value="">Select a car type</option>
          {carTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Number of Cars:</label>
        <input
          type="number"
          value={numOfCars}
          onChange={(e) => setNumOfCars(parseInt(e.target.value))}
          min={1}
          required
        />
      </div>
      <div className="result">
        {availableCars !== null && (
          <>
            <p>Available Cars: {availableCars}</p>
            {remainingCars > 0 && <p>Cars Still Needed: {remainingCars}</p>}
          </>
        )}
      </div>
      <div className="button-group">
        {availableCars === null ? (
          <button type="button" onClick={handleSearch}>
            Check Availability
          </button>
        ) : (
          <>
            {remainingCars === 0 ? (
              <button type="button" onClick={handleDelivery}>
                Delivery Now
              </button>
            ) : (
              <button type="button" onClick={handleScanAgain}>
                Scan Other Locations
              </button>
            )}
          </>
        )}
      </div>
      {selectedServicePoint && (
        <>
          <Marker position={getCoordinatesOfServicePoint(selectedServicePoint)} icon={IconDest}>
            <Popup>
              <EventDetails cityName={selectedServicePoint} totalAvailableCars={availableCars} />
            </Popup>
          </Marker>
          {nearestServiceStations.map((station, index) => (
            <Marker
              key={index}
              position={[station.latitude, station.longitude]}
              icon={NewIcon}
            >
              <Popup>
                <EventDetails
                  cityName={station.locatedInCity || "Unknown Station"}
                  totalAvailableCars={availableCars === null ? "Loading..." : availableCars}
                  distance={station.distanceInMiles}
                />
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </form>
  );
};

export default EventBookingForm;
