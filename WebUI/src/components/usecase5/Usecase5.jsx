import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NOLInputForm from "./NOLInputForm";

import Legend from "./Legend";
import "../../styles/FleetMapDisplay.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-curve";
import NOLFleetCarDisplayModal from "./NOLFleetCarDisplayModal";

const ServicePointIcon = L.divIcon({
  className: "custom-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/servicepoint.png") +
    '" style="width: 20px; height: 20px;" /></div>',
  iconAnchor: [10, 20],
});

const ServicePointIconHighlighted = L.divIcon({
  className: "custom-icon highlighted-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/red-location-icon.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});


function FleetMapDisplay() {
  const [serviceStations, setServiceStations] = useState([]);
  const [allServicePoints, setAllServicePoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [optimizationDetails, setOptimizationDetails] = useState({
    fromStation: "",
    selectedStations: [],
  });
  const mapRef = useRef();
  const popupRefs = useRef([]);

  const [filteredServicePoints, setFilteredServicePoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
 
  const [selectedStation, setSelectedStation] = useState(null);
 

  useEffect(() => {
    const fetchAllServicePoints = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8020/api/car/get/servicePoints"
        );
        const data = response.data.map((location) => ({
          id: location._id,
          name: location.name,
          coordinates: location.coordinates
            .split(",")
            .map((coord) => parseFloat(coord)),
          image: location.image,
          totalCars: location.totalCars,
        }));
        setAllServicePoints(data);
      } catch (error) {
        console.error("Error fetching service points:", error);
      }
    };
    fetchAllServicePoints();
  }, []);

  useEffect(() => {
    const filteredPoints = allServicePoints.filter((point) => {
      const isServiceStation = serviceStations.some(
        (station) => station.servicePointName === point.name
      );
      const isNearestServiceStation = serviceStations.some((station) =>
        station.nearestServiceStations.some(
          (nearestStation) =>
            nearestStation.latitude === point.coordinates[0] &&
            nearestStation.longitude === point.coordinates[1]
        )
      );
      return !isServiceStation && !isNearestServiceStation;
    });

    setFilteredServicePoints(filteredPoints);
  }, [allServicePoints, serviceStations]);

  const handleClosePopup = (popupIndex) => {
    popupRefs.current[popupIndex].remove();
  };

  return (
    <div className="fleet-opt-container">
      <NOLInputForm setServiceStations={setServiceStations} />
      <MapContainer
        center={[49.4875, 8.466]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", position: "relative" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredServicePoints.map((point, index) => (
          <Marker
            key={point?.id}
            position={point?.coordinates}
            icon={ServicePointIcon}
          >
            <Popup ref={(ref) => (popupRefs.current[index] = ref)}>
              <div className="popup">
                <button
                  className="close-popup-btn"
                  onClick={() => handleClosePopup(index)}
                >
                  ✕
                </button>
                <h3>{point.name} Station</h3>
                <img src={point.image} alt={point.name} />
                <p>Total Cars: {point.totalCars}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {serviceStations.map((station, index) => (
          <Marker
            key={index}
            position={[station?.latitude, station?.longitude]}
            icon={ServicePointIconHighlighted}
          >
            <Popup
              ref={(ref) =>
                (popupRefs.current[filteredServicePoints.length + index] = ref)
              }
            >
              <div style={{ alignContent: "flex-start" }} className="popup">
                <button
                  className="close-popup-btn"
                  onClick={() =>
                    handleClosePopup(filteredServicePoints.length + index)
                  }
                >
                  ✕
                </button>
                <h3>{station.servicePointName} Station</h3>
                <img
                  src={station.servicePointImage}
                  alt={station.servicePointName}
                />
                <p>Total Cars: {station.totalCarsAvailable}</p>
                <p>Total Bookings: {station.totalBookings}</p>
               
              </div>
            </Popup>
          </Marker>
        ))}

        

        <Legend />
       
        {selectedStation && (
          <NOLFleetCarDisplayModal
            show={showModal}
            onClose={() => setShowModal(false)}
          > 
           
          </NOLFleetCarDisplayModal>
        )}

    
      </MapContainer>
    </div>
  );
}

export default FleetMapDisplay;
