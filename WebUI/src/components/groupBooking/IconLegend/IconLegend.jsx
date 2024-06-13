import { Icon } from "leaflet";
import React from "react";
const destIcon = new Icon({
  iconUrl: require("../../../Assets/userLocation.png"),
  iconSize: [40, 40],
});

const serviceStationIcon = new Icon({
  iconUrl: require("../../../Assets/stationLocation.png"),
  iconSize: [50, 50],
});

const IconLegend = () => {
  return (
    <div className="icon-legend">
      <div className="legend-item">
        <img src={destIcon.options.iconUrl} alt="User Location" />
        <span>User Location</span>
      </div>
      <div className="legend-item">
        <img src={serviceStationIcon.options.iconUrl} alt="Service Station" />
        <span>Service Station</span>
      </div>
    </div>
  );
};

export default IconLegend;