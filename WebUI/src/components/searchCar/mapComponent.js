import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import L from 'leaflet';
import '../../styles/searchCar/mapComponent.css';
import Legend from "./Legend";
import OptimizationDisplay from "./OptimizationDisplay";

// Fix the default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const passengerLocation = L.divIcon({
  className: "custom-icon highlighted-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/green-location-icon.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});

const serviceStationIcon = L.divIcon({
  className: "custom-icon service-station-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/servicepoint.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});

const destinationIcon = L.divIcon({
  className: "custom-icon destination-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/red-location-icon.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});

// Define a new icon for route locations
const routeLocationIcon = L.divIcon({
  className: "custom-icon route-location-icon",
  html:
    '<div class="inner-icon"><img src="' +
    require("../../Assets/nearestrouteicon.png") +
    '" style="width: 40px; height: 40px;" /></div>',
  iconAnchor: [20, 40],
});

const MapComponent = ({ locations, selectedLocation, onLocationChange, fromDate, toDate, destination, enableSharing, onSearch, routeDetails }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation.coordinates, 12);
    }
  }, [selectedLocation, map]);

  useEffect(() => {
    if (routeDetails) {
      const bounds = [];

      routeDetails.routeDetails.forEach(detail => {
        if (detail.latitude && detail.longitude) {
          bounds.push([detail.latitude, detail.longitude]);
        }
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [routeDetails, map]);

  const handleMarkerClick = (location) => {
    onLocationChange(location);
  };

  const handleBookNowClick = () => {
    if (!fromDate || !toDate || (enableSharing && !destination)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required fields.',
        icon: 'error',
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
      });
      return;
    }
    onSearch();
  };

  const passengerCount = routeDetails ? routeDetails.passengerDetails.filter(detail => detail.type === "passenger").length : 0;

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {routeDetails ? (
        <>
          {routeDetails.passengerDetails.map((detail, index) => (
            detail.type === "passenger" && (
              <Marker
                key={`passenger-${index}`}
                position={[detail.latitude, detail.longitude]}
                icon={passengerLocation}
              >
                <Popup>
                  <div className='popup'>
                    <h1 className='header'>{detail.locationName}</h1>
                    <p>Passenger: {detail.name}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          {routeDetails.passengerDetails.map((detail, index) => (
            detail.type === "serviceStation" && (
              <Marker
                key={`serviceStation-${index}`}
                position={[detail.latitude, detail.longitude]}
                icon={serviceStationIcon}
              >
                <Popup>
                  <div className='popup'>
                    <h1 className='header'>Driver Starting Location</h1>
                    <p>Service Station</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          {routeDetails.passengerDetails.map((detail, index) => (
            detail.type === "destination" && (
              <Marker
                key={`destination-${index}`}
                position={[detail.latitude, detail.longitude]}
                icon={destinationIcon}
              >
                <Popup>
                  <div className='popup'>
                    <h1 className='header'>Destination Location</h1>
                    <p>Destination</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          {routeDetails.routeDetails.map((detail, index) => {
            // Check if the detail is already in passengerDetails or destination
            const isDuplicate = routeDetails.passengerDetails.some(passengerDetail =>
              passengerDetail.longitude === detail.longitude && passengerDetail.latitude === detail.latitude
            );
            // Render the marker only if it's not a duplicate
            if (!isDuplicate) {
              return (
                <Marker
                  key={`route-${index}`}
                  position={[detail.latitude, detail.longitude]}
                  icon={routeLocationIcon}
                >
                  <Popup>
                    <div className='popup'>
                      <h1 className='header'>{detail.cityname}</h1>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
          <Polyline
            positions={routeDetails.routeDetails.map(detail => [detail.latitude, detail.longitude])}
            color="blue"
            dashArray="5"
          />
          <Legend />
          <OptimizationDisplay
            noOfPassengers={passengerCount}
            totalDistance={routeDetails.totalDistanceInMiles}
          />
        </>
      ) : (
        locations.map(location => (
          <Marker
            key={location.id}
            position={location.coordinates}
            eventHandlers={{
              click: () => handleMarkerClick(location)
            }}
          >
            <Popup>
              <div className='popup'>
                <h1 className='header'>{location.name}</h1>
                <img src={location.image} alt={location.name} />
                <p>Total Cars: {location.totalCars}</p>
                <button className="btn-success" onClick={handleBookNowClick()}>Book now</button>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </>
  );
};

const MapWrapper = ({ locations, selectedLocation, onLocationChange, fromDate, toDate, destination, enableSharing, onSearch, routeDetails }) => {
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <MapComponent
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
        fromDate={fromDate}
        toDate={toDate}
        destination={destination}
        enableSharing={enableSharing}
        onSearch={onSearch}
        routeDetails={routeDetails} // Pass route details to MapComponent
      />
    </MapContainer>
  );
};

export default MapWrapper;

