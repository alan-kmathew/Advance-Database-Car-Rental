import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import "./GroupBooking.css";
import GroupBookingForm from "./Form/GroupBookingForm";
import { useState } from "react";
import PlanView from "./PlanView/PlanView";
import { Icon } from "leaflet";

const destIcon = new Icon({
  iconUrl: require("../../Assets/userLocation.png"),
  iconSize: [40, 40],
});
const serviceStationIcon = new Icon({
  iconUrl: require("../../Assets/stationLocation.png"),
  iconSize: [50, 50],
});

const GroupBooking = () => {
  const [plan, setPlan] = useState({});
  const [ssLocations, setSsLocations] = useState([]);
  const [showSsLocationsCity, setShowSsLocationsCity] = useState(0);

  const setNewPlan = (newPlan) => {
    setPlan(newPlan);
    setIsPlanView(true);
    let newSsLocations = [];
    Object.entries(newPlan).map((planItem, index) => {
      let userLocation = [planItem[1].location.lat, planItem[1].location.lon];
      planItem[1].carsFromServiceStations.map((ss) => {
        newSsLocations.push({
          location: [ss.location.lat, ss.location.lon],
          userCity: index,
          userLocation: userLocation,
        });
      });
    });
    console.log(newSsLocations);
    setSsLocations(newSsLocations);
  };
  const [isPlanView, setIsPlanView] = useState(false);
  const visibleLineOptions = { color: "#6927F3" };
  const hiddenLineOptions = { color: "#ffffff00" };

  return (
    <>
      {isPlanView ? (
        <PlanView
          plan={plan}
          goBack={() => {
            setIsPlanView(false);
          }}
          showSsLocationsCity={showSsLocationsCity}
          setShowSsLocationsCity={setShowSsLocationsCity}
        />
      ) : (
        <GroupBookingForm setPlan={setNewPlan} />
      )}
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
        {
          // markers for the service stations for each requirement
          ssLocations.map((ssLocation, index) => {
            console.log(ssLocation);
            return (
              <>
                <Marker
                  key={`ssLoc${index}`}
                  icon={serviceStationIcon}
                  position={ssLocation.location}
                  opacity={ssLocation.userCity == showSsLocationsCity ? 1 : 0}
                ></Marker>
                <Polyline
                  key={`ssLocLine${index}`}
                  positions={[ssLocation.location, ssLocation.userLocation]}
                  pathOptions={
                    ssLocation.userCity == showSsLocationsCity
                      ? visibleLineOptions
                      : hiddenLineOptions
                  }
                />
              </>
            );
          })
        }
        {
          // markers for the user cities
          Object.entries(plan).map((planItem, index) => {
            return (
              <Marker
                key={`city${index}`}
                icon={destIcon}
                position={[planItem[1].location.lat, planItem[1].location.lon]}
                eventHandlers={{
                  click: (e) => {
                    setShowSsLocationsCity(index);
                  },
                }}
              ></Marker>
            );
          })
        }
      </MapContainer>
    </>
  );
};

export default GroupBooking;
