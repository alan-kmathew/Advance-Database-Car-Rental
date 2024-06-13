import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import FleetInputForm from "./FleetInputForm";
import Legend from "./Legend";
import "../../styles/FleetMapDisplay.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-curve";
import FleetCarDisplayModal from "./FleetCarDisplayModal";
import FleetFormModal from "./FleetFormModal";
import OptimizationDisplay from "./OptimizationDisplay";

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

const NearestServicePointIconHighlighted = L.divIcon({
  className: "custom-icon highlighted-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/green-location-icon.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});

const NearestRouteIcon = L.divIcon({
  className: "custom-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/nearestrouteicon.png") +
    '" style="width: 30px; height: 30px;" /></div>',
  iconAnchor: [15, 30],
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
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedNearestStation, setNearestSelectedStation] = useState(null);
  const [shortestRouteDetails, setShortestRouteDetails] = useState([]);

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

  const handleMoreDetailsClick = (station, popupIndex) => {
    popupRefs.current[popupIndex].remove(); // Close the popup
    setSelectedStation(station);
    setShowModal(true);
  };

  const handleOpenFormClick = (station, popupIndex) => {
    popupRefs.current[popupIndex].remove(); // Close the popup
    setNearestSelectedStation(station);
    setShowFormModal(true);
  };

  const handleClosePopup = (popupIndex) => {
    popupRefs.current[popupIndex].remove();
  };

  const Curves = ({ stations }) => {
    const map = useMap();

    useEffect(() => {
      stations.forEach((station) => {
        station.nearestServiceStations.forEach((nearestStation) => {
          const from = [station.latitude, station.longitude];
          const to = [nearestStation.latitude, nearestStation.longitude];
          const latlngs = createCurve(from, to);

          L.curve(latlngs, {
            color: "darkred",
            weight: 3,
            opacity: 0.8,
            dashArray: "5, 5",
          }).addTo(map);
        });
      });

      return () => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Curve) {
            map.removeLayer(layer);
          }
        });
      };
    }, [map, stations]);

    return null;
  };

  const ShortestRoutes = ({ routes }) => {
    const map = useMap();

    useEffect(() => {
      const routeLayers = [];
      let totalDistance = 0;

      routes.forEach((route) => {
        totalDistance += route.totalDistance;
        route.routeDetails.forEach((detail, index) => {
          if (index < route.routeDetails.length - 1) {
            const from = [detail.latitude, detail.longitude];
            const to = [
              route.routeDetails[index + 1].latitude,
              route.routeDetails[index + 1].longitude,
            ];
            const latlngs = createCurve(from, to);

            const curve = L.curve(latlngs, {
              color: "blue",
              weight: 3,
              opacity: 0.8,
              dashArray: "5, 5",
            }).addTo(map);

            routeLayers.push(curve);
          }
        });

        // Add markers with popups for each point in the route
        route.routeDetails.forEach((detail, index) => {
          // Skip the first and last markers to avoid overlap
          if (
            index !== 0 &&
            index !== route.routeDetails.length - 1 &&
            !allServicePoints.some(
              (point) =>
                point.coordinates[0] === detail.latitude &&
                point.coordinates[1] === detail.longitude
            )
          ) {
            const marker = L.marker([detail.latitude, detail.longitude], {
              icon: NearestRouteIcon,
            })
              .addTo(map)
              .bindPopup(
                `<div style="text-align: center;"><b>${
                  detail?.pathName || detail?.cityname
                }</b></div>`
              );
            routeLayers.push(marker);
          }
        });
      });

      setTotalDistance(totalDistance);

      return () => {
        routeLayers.forEach((layer) => {
          map.removeLayer(layer);
        });
      };
    }, [map, routes]);

    return null;
  };

  const createCurve = (latlng1, latlng2) => {
    const offsetX = latlng2[1] - latlng1[1];
    const offsetY = latlng2[0] - latlng1[0];

    const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const theta = Math.atan2(offsetY, offsetX);

    const thetaOffset = Math.PI / 10;

    const r2 = r / 2 / Math.cos(thetaOffset);
    const theta2 = theta - thetaOffset;

    const midpointX = r2 * Math.cos(theta2) + latlng1[1];
    const midpointY = r2 * Math.sin(theta2) + latlng1[0];

    const midpointLatLng = [midpointY, midpointX];

    return ["M", latlng1, "Q", midpointLatLng, latlng2];
  };

  return (
    <div className="fleet-opt-container">
      <FleetInputForm setServiceStations={setServiceStations} />
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
                
                <a
                  style={{ marginTop: "10px" }}
                  href="#"
                  className="more-details-link"
                  onClick={() =>
                    handleMoreDetailsClick(
                      station,
                      filteredServicePoints.length + index
                    )
                  }
                >
                  Add Another Station
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {serviceStations.map((station, stationIndex) =>
          station?.nearestServiceStations.map(
            (nearestStation, nearestIndex) => (
              <Marker
                key={`${station?.servicePointId}-${nearestIndex}`}
                position={[nearestStation?.latitude, nearestStation?.longitude]}
                icon={NearestServicePointIconHighlighted}
              >
                <Popup
                  ref={(ref) =>
                    (popupRefs.current[
                      filteredServicePoints.length +
                        serviceStations.length +
                        stationIndex * station.nearestServiceStations.length +
                        nearestIndex
                    ] = ref)
                  }
                >
                  <div className="popup">
                    <button
                      className="close-popup-btn"
                      onClick={() =>
                        handleClosePopup(
                          filteredServicePoints.length +
                            serviceStations.length +
                            stationIndex *
                              station.nearestServiceStations.length +
                            nearestIndex
                        )
                      }
                    >
                      ✕
                    </button>
                    <h2>{nearestStation.locatedInCity} Station</h2>
                    <img
                      src={nearestStation.image}
                      alt={nearestStation.locatedInCity}
                    />
                    <p>Total Cars: {nearestStation.carList.length}</p>
                    <a
                      style={{ marginTop: "10px" }}
                      href="#"
                      className="more-details-link"
                      onClick={() =>
                        handleOpenFormClick(
                          nearestStation,
                          filteredServicePoints.length +
                            serviceStations.length +
                            stationIndex *
                              station.nearestServiceStations.length +
                            nearestIndex
                        )
                      }
                    >
                      Open Form
                    </a>
                  </div>
                </Popup>
              </Marker>
            )
          )
        )}

        <Curves stations={serviceStations} />
        <ShortestRoutes routes={shortestRouteDetails} />

        <Legend />
        <OptimizationDisplay
          distance={totalDistance}
          fromStation={optimizationDetails.fromStation}
          selectedStations={optimizationDetails.selectedStations}
        />
        {selectedStation && (
          <FleetCarDisplayModal
            show={showModal}
            onClose={() => setShowModal(false)}
          >
            <h1>Available Cars</h1>
            <div className="car-list">
              {selectedStation.carList.map((car) => (
                <div key={car._id} className="car-item">
                  <img src={car.image} alt={car.model} />
                  <div className="car-item-details">
                    <p>Model: {car.model}</p>
                    <p>Type: {car.type}</p>
                    <p>Seats: {car.seats}</p>
                  </div>
                </div>
              ))}
            </div>
          </FleetCarDisplayModal>
        )}

        {selectedNearestStation && (
          <FleetFormModal
            show={showFormModal}
            onClose={() => setShowFormModal(false)}
            allServicePoints={allServicePoints}
            selectedNearestStation={selectedNearestStation}
            setShortestRouteDetails={setShortestRouteDetails}
            setOptimizationDetails={setOptimizationDetails}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default FleetMapDisplay;
