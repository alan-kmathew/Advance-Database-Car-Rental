import React from 'react'
import EventBooking from "../eventBooking/EventBooking"
import FleetOptForm from './FleetForm';
import "../../styles/FleetOpt.css"


function FleetOpt() {
  return (
    <div className="fleet-opt-container">
      <FleetOptForm /> {/* Add the form component here */}
      <EventBooking showForm={false} />
    </div>
  );
}

export default FleetOpt;
