// Passenger.jsx
import React from 'react';
import '../../styles/passenger.css';
import PassengerMap from '../PassengerMap';
import PassengerForm from './PassengerForm';

const Passenger = () => {
  return (
    <div className="passenger-container">
      <PassengerForm />
      <PassengerMap />
    </div>
  );
};

export default Passenger;
