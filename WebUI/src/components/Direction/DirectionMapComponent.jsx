import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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

const DirectionsMap = ({ locations, selectedLocation, onLocationChange, directions }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation.coordinates, 8);
    }
  }, [selectedLocation, map]);

  const handleMarkerClick = (location) => {
    onLocationChange(location);
  };
  const passengerCount = directions ? directions.passengerDetails.filter(detail => detail.type === "passenger").length : 0;

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {directions ? (
        <>
          {directions.passengerDetails.map((detail, index) => (
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
          {directions.passengerDetails.map((detail, index) => (
            detail.type === "serviceStation" && (
              <Marker
                key={`serviceStation-${index}`}
                position={[detail.latitude, detail.longitude]}
                icon={serviceStationIcon}
              >
                <Popup>
                  <div className='popup'>
                    <h1 className='header'>Driver Starting Location</h1>
                    <p>{detail.cityname}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
          {directions.passengerDetails.map((detail, index) => (
            detail.type === "destination" && (
              <Marker
                key={`destination-${index}`}
                position={[detail.latitude, detail.longitude]}
                icon={destinationIcon}
              >
                <Popup>
                  <div className='popup'>
                    <h1 className='header'>Destination Location</h1>
                    <p>{detail.cityname}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
         {directions.routeDetails.map((detail, index) => {
            // Check if the detail is already in passengerDetails or destination
            const isDuplicate = directions.passengerDetails.some(passengerDetail =>
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
            positions={directions.routeDetails.map(detail => [detail.latitude, detail.longitude])}
            color="blue"
            dashArray="5"
          />
          <Legend />
          <OptimizationDisplay
            noOfPassengers={passengerCount}
            totalDistance={directions.totalDistanceInMiles}
          />
        </>
      ) : (locations.map(location => (
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
            </div>
          </Popup>
        </Marker>
      )))

      }

    </>
  );
};

const DirectionsMapWrapper = ({ locations, selectedLocation, onLocationChange, directions }) => {
  console.log("directions in map wrapper---------->", directions);
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <DirectionsMap
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
        directions={directions}
      />
    </MapContainer>
  );
};

export default DirectionsMapWrapper;
