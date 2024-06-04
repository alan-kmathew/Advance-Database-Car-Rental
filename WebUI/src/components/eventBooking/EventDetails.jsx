import React, { useState, useEffect } from 'react';

function EventDetails({ city }) {
  const [carDetails, setCarDetails] = useState(null);

  useEffect(() => {
    // This is a placeholder. Replace with your actual API call.
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`https://your-api.com/cars?city=${city}`);
        const data = await response.json();
        setCarDetails(data);
      } catch (error) {
        console.error("Failed to fetch car details:", error);
      }
    };

    fetchCarDetails();
  }, [city]);

  if (!carDetails) return <div>Loading car details...</div>;

  return (
    <div>
      <h3>Available Cars in {city}</h3>
      <p>Total Available: {carDetails.totalCount}</p>
      <ul>
        {carDetails.cars.map((car, index) => (
          <li key={index}>{car.model} - {car.count} available</li>
        ))}
      </ul>
    </div>
  );
}

export default EventDetails;