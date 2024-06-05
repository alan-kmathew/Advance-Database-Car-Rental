// import React, { useState, useEffect } from 'react';
// import { useMap, Marker, Popup } from 'react-leaflet';
// import L from "leaflet";
// import CustomDropdown from './CustomDropdownEvent';
// import "../../styles/EventbookingForm.css";
// import axios from 'axios';
// import EventDetails from './EventDetails';

// const NewIcon = L.icon({
//   iconUrl: require("../../Assets/dest.png"),
//   iconSize: [40, 40],
// });

// const IconDest = L.icon({
//   iconUrl: require("../../Assets/Service.png"),
//   iconSize: [38, 38],
// });

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
//       map.setView(servicePointCoordinates, 12);
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

//   const handleScanAgain = () => {
//     // In a real-world scenario, you would make an API call to check other service points
//     // For now, we'll just show an alert
//     alert(`Scanning other locations for ${remainingCars} more ${selectedCarType}(s)...`);
//   };

//   const handleServicePointSelection = (point) => {
//     setSelectedServicePoint(point);
//     setAvailableCars(null);
//     setRemainingCars(0);
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
//     </form>
//   );
// };

// export default EventBookingForm;


// import React, { useState, useEffect } from 'react';
// import { useMap, Marker, Popup } from 'react-leaflet';
// import L from "leaflet";
// import CustomDropdown from './CustomDropdownEvent';
// import "../../styles/EventbookingForm.css";
// import axios from 'axios';
// import EventDetails from './EventDetails';

// const NewIcon = L.icon({
//   iconUrl: require("../../Assets/dest.png"),
//   iconSize: [40, 40],
// });

// const IconDest = L.icon({
//   iconUrl: require("../../Assets/Service.png"),
//   iconSize: [38, 38],
// });

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
//   const [isScanning, setIsScanning] = useState(false);
//   const [nearestStationMarker, setNearestStationMarker] = useState(null);
//   const [deliveryEnabled, setDeliveryEnabled] = useState(false);
//   const [scanning, setScanning] = useState(false);
//   const [availabilityChecked, setAvailabilityChecked] = useState(false);

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
//       map.setView(servicePointCoordinates, 12);
//       if (nearestStationMarker) {
//         map.removeLayer(nearestStationMarker);
//         setNearestStationMarker(null);
//       }
//     } else {
//       map.setView([51.1657, 10.4515], 6); // Default view of Germany
//     }
//   }, [selectedServicePoint, map, nearestStationMarker]);

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
//       setAvailabilityChecked(true);

//       if (numOfCars <= available) {
//         setRemainingCars(0);
//         setDeliveryEnabled(true);
//       } else {
//         setRemainingCars(numOfCars - available);
//         setDeliveryEnabled(false);
//         setScanning(true);
//       }
//     } catch (error) {
//       console.error('Error fetching available cars:', error);
//     }
//   };

//   const handleDelivery = () => {
//     alert("Delivery initiated!");
//   };

//   const handleScanAgain = async () => {
//     setIsScanning(true);
//     try {
//       const params = new URLSearchParams({ cityName: selectedServicePoint });
//       const url = `http://localhost:8020/api/car/get/nearest/servicestation?${params.toString()}`;
//       const response = await axios.get(url);
  
//       const nearestStation = response.data;
//       alert(`Nearest service station found: ${nearestStation.name}`);
  
//       // Add the nearest service station to the map
//       const coordinates =
//         nearestStation.coordinates &&
//         nearestStation.coordinates
//           .split(',')
//           .map((coord) => parseFloat(coord.trim()));
  
//       if (coordinates && coordinates.length === 2) {
//         addNearestStationToMap(nearestStation.name, coordinates);
//       } else {
//         alert('Invalid coordinates received for the nearest service station.');
//       }
  
//       // Now let's check if this station has the remaining cars we need
//       const availabilityResponse = await axios.get(`http://localhost:8020/api/car/get/cars`, {
//         params: {
//           servicePointName: nearestStation.name,
//           carCategory: selectedCarType,
//         },
//       });
  
//       const availableAtNearestStation = availabilityResponse.data.totalCarsAvailable;
//       if (availableAtNearestStation >= remainingCars) {
//         alert(`Great news! ${nearestStation.name} has the remaining ${remainingCars} ${selectedCarType}(s) you need.`);
//         setRemainingCars(0);
//         setDeliveryEnabled(true);
//       } else {
//         alert(`${nearestStation.name} has ${availableAtNearestStation} ${selectedCarType}(s). You still need ${remainingCars - availableAtNearestStation} more.`);
//         setRemainingCars(remainingCars - availableAtNearestStation);
//       }
//     } catch (error) {
//       console.error('Error scanning other locations:', error);
//       alert('Error scanning other locations. Please try again.');
//     } finally {
//       setIsScanning(false);
//     }
//   };

//   const addNearestStationToMap = (stationName, coordinates) => {
//     if (nearestStationMarker) {
//       nearestStationMarker.remove(); // Use the remove method to remove the marker from the map
//     }

//     const newMarker = L.marker(coordinates, { icon: NewIcon });
//     newMarker.addTo(map); // Add the new marker to the map
//     newMarker.bindPopup(`<b>Nearest Station:</b><br>${stationName}`).openPopup();
//     setNearestStationMarker(newMarker);

//     map.setView(coordinates, 12);
//   };

//   const handleServicePointSelection = (point) => {
//     setSelectedServicePoint(point);
//     setAvailableCars(null);
//     setRemainingCars(0);
//     setDeliveryEnabled(false);
//     setAvailabilityChecked(false); // Reset when changing service point
//     const servicePointCoordinates = getCoordinatesOfServicePoint(point);
//     map.setView(servicePointCoordinates, 12);
//     if (nearestStationMarker) {
//       map.removeLayer(nearestStationMarker);
//       setNearestStationMarker(null);
//     }
//   };

//   const getCoordinatesOfServicePoint = (point) => {
//     const servicePoint = servicePoints.find(sp => sp.value === point);
//     return servicePoint ? servicePoint.coordinates : [0, 0];
//   };

//   const handleDestinationChange = (value) => {
//     if (destinations.includes(value)) {
//       // Remove the deselected destination
//       setDestinations(destinations.filter(dest => dest !== value));
//     } else {
//       // Add the selected destination
//       setDestinations([...destinations, value]);
//     }
//   };

//   return (
//     <form className="event-booking-form">
//       <div className="input-group">
//         <label>From Date:</label>
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           required
//         />
//       </div>
//       <div className="input-group">
//         <label>To Date:</label>
//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           required
//         />
//       </div>
//       <div className="input-group">
//         <label>Service Point:</label>
//         <select
//           value={selectedServicePoint}
//           onChange={(e) => handleServicePointSelection(e.target.value)}
//           required
//         >
//           <option value="">Select a service point</option>
//           {servicePoints.map((option, index) => (
//             <option key={index} value={option.value}>
//               {option.label}
//             </option>
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
//             setAvailableCars(null); // Reset when changing car type
//             setDeliveryEnabled(false);
//           }}
//           required
//         >
//           <option value="">Select a car type</option>
//           {carTypes.map((type, index) => (
//             <option key={index} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="input-group">
//         <label>Number of Cars:</label>
//         <input
//           type="number"
//           value={numOfCars}
//           onChange={(e) => {
//             const num = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
//             setNumOfCars(num);
//             setAvailableCars(null); // Reset when changing number of cars
//             setDeliveryEnabled(false);
//           }}
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
//               <button 
//                 type="button" 
//                 onClick={handleScanAgain} 
//                 disabled={isScanning}
//               >
//                 {isScanning ? "Scanning..." : "Scan Other Locations"}
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
//     </form>
//   );
// };

// export default EventBookingForm;




import React, { useState, useEffect } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from "leaflet";
import CustomDropdown from './CustomDropdownEvent';
import "../../styles/EventbookingForm.css";
import axios from 'axios';
import EventDetails from './EventDetails';

const NewIcon = L.icon({
  iconUrl: require("../../Assets/dest.png"),
  iconSize: [40, 40],
});

const IconDest = L.icon({
  iconUrl: require("../../Assets/Service.png"),
  iconSize: [38, 38],
});

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
  const map = useMap();

  const carTypes = ["Sedan", "SUV", "Limousine", "Hatchback", "Convertible", "Wagon", "Coupe", "Muscle"];
  const destinationOptions = ["Berlin", "Dortmund", "Munich", "Leipzig"];

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
      const response = await axios.get(`http://localhost:8020/api/car/get/nearest/servicestation?cityName=${selectedServicePoint}`);
      const nearestServiceStationCoordinates = response.data?.coordinates?.split(',').map(coord => parseFloat(coord.trim()));
      if (nearestServiceStationCoordinates && nearestServiceStationCoordinates.length === 2) {
        map.setView(nearestServiceStationCoordinates, 12);
      } else {
        console.error('Invalid coordinates received:', nearestServiceStationCoordinates);
      }
    } catch (error) {
      console.error('Error fetching nearest service station:', error);
    }
  };
  

  const handleServicePointSelection = (point) => {
    setSelectedServicePoint(point);
    setAvailableCars(null);
    setRemainingCars(0);
    const servicePointCoordinates = getCoordinatesOfServicePoint(point);
    map.setView(servicePointCoordinates, 12);
  };

  const getCoordinatesOfServicePoint = (point) => {
    const servicePoint = servicePoints.find(sp => sp.value === point);
    return servicePoint ? servicePoint.coordinates : [0, 0];
  };

  const handleDestinationChange = (value) => {
    if (destinations.includes(value)) {
      setDestinations(destinations.filter(dest => dest !== value));
    } else {
      setDestinations([...destinations, value]);
    }
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
          {servicePoints.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <CustomDropdown
        options={destinationOptions}
        selectedOptions={destinations}
        onSelectionChange={handleDestinationChange}
        label="Destination"
      />
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
        <Marker position={getCoordinatesOfServicePoint(selectedServicePoint)} icon={IconDest}>
          <Popup>
            <EventDetails cityName={selectedServicePoint} totalAvailableCars={availableCars} />
          </Popup>
        </Marker>
      )}
    </form>
  );
};

export default EventBookingForm;
