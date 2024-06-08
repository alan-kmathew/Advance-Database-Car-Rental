import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import FleetOptForm from "./FleetForm";
import "../../styles/FleetOpt.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import CustomPopup from "./CustomPopup";
import L from "leaflet";

// Define icons
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

function FleetOpt() {
  const [serviceStations, setServiceStations] = useState([]);
  const [allServicePoints, setAllServicePoints] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const highlightedMarkersRefs = useRef([]);
  const mapRef = useRef();

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
          cars: [],
        }));
        setAllServicePoints(data);
      } catch (error) {
        console.error("Error fetching service points:", error);
      }
    };
    fetchAllServicePoints();
  }, []);

  const filteredServicePoints = allServicePoints.filter(
    (point) =>
      !serviceStations.some(
        (station) => station.servicePointName === point.name
      )
  );

  const handlePopupOpen = (point, event) => {
    const { containerPoint } = event;
    const mapContainer = mapRef.current.getContainer();
    const mapBounds = mapContainer.getBoundingClientRect();
    const popupHeight = 150;
    const popupWidth = 150;

    let adjustedX = containerPoint.x;
    let adjustedY = containerPoint.y;

    if (containerPoint.x + popupWidth / 2 > mapBounds.width) {
      adjustedX = mapBounds.width - popupWidth / 2;
    } else if (containerPoint.x - popupWidth / 2 < 0) {
      adjustedX = popupWidth / 2;
    }

    if (containerPoint.y - popupHeight < 0) {
      adjustedY = popupHeight;
    }

    setPopupInfo({ ...point, position: { x: adjustedX, y: adjustedY } });
  };

  const handlePopupClose = () => {
    setPopupInfo(null);
  };

  const MapEvents = () => {
    useMapEvents({
      click: () => {
        handlePopupClose();
      },
    });
    return null;
  };

  return (
    <div className="fleet-opt-container">
      <FleetOptForm setServiceStations={setServiceStations} />
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
        <MapEvents />
        {filteredServicePoints.map((point) => (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={ServicePointIcon}
            eventHandlers={{
              click: (event) => handlePopupOpen(point, event),
            }}
          ></Marker>
        ))}

        {serviceStations.map((station, index) => (
          <Marker
            key={index}
            position={[station.latitude, station.longitude]}
            icon={ServicePointIconHighlighted}
            ref={(el) => (highlightedMarkersRefs.current[index] = el)}
            eventHandlers={{
              click: (event) => handlePopupOpen(station, event),
            }}
          ></Marker>
        ))}

        {popupInfo && (
          <CustomPopup info={popupInfo} onClose={handlePopupClose} />
        )}
      </MapContainer>
    </div>
  );
}

export default FleetOpt;
