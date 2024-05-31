// MapComponent.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import carImage from '../Assets/bmw.jpeg';
import carIcon from '../Assets/car-icon.jpeg';
import '../styles/MapComponent.css';
import CustomDropdown from '../components/CustomDropdown';

// Fix the default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const cities = [
  {
    name: 'Berlin',
    coordinates: [52.52, 13.4050],
    availableCars: 20,
    availableServiceWorkers: 5,
    price: '30$',
    cars: [
      { name: 'BMW X1', seats: 4, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
    ],
  },
  {
    name: 'Nuremberg',
    coordinates: [49.4521, 11.0767],
    availableCars: 15,
    availableServiceWorkers: 7,
    price: '40$',
    cars: [
      { name: 'BMW X1', seats: 4, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
    ],
  },
  {
    name: 'Hamburg',
    coordinates: [53.5511, 9.9937],
    availableCars: 25,
    availableServiceWorkers: 5,
    price: '50$',
    cars: [
      { name: 'BMW X1', seats: 4, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
    ],
  },
  {
    name: 'Heidelberg',
    coordinates: [49.3988, 8.6724],
    availableCars: 10,
    availableServiceWorkers: 15,
    price: '25$',
    cars: [
      { name: 'BMW X1', seats: 4, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
    ],
  },
  {
    name: 'Mannheim',
    coordinates: [49.4875, 8.4660],
    availableCars: 18,
    availableServiceWorkers: 10,
    price: '35$',
    cars: [
      { name: 'BMW X1', seats: 4, image: carImage },
      { name: 'Audi A4', seats: 5, image: carImage },
    ],
  },
];

const MapComponent = ({ selectedLocation }) => {
  const map = useMap();
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (selectedLocation) {
      map.setView(selectedLocation.coordinates, 12); // Adjust zoom level as needed
    }
  }, [selectedLocation, map]);

  const handleCarSelection = (car) => {
    setSelectedCar(car);
  };

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {cities.map(city => (
        <Marker key={city.name} position={city.coordinates}>
          <Popup>
            <div className='popup'>
              <h1 className='header'>{city.name}</h1>
              <p className='no-cars'>Total Available cars: {city.availableCars}</p>
              <p>Available service workers: {city.availableServiceWorkers}</p>
              <CustomDropdown options={city.cars} onSelect={handleCarSelection} />
              <button className="btn btn-success">Book now</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapWrapper = ({ selectedLocation }) => {
  return (
    <MapContainer center={[51.1657, 10.4515]} zoom={6} style={{ height: "100vh", width: "100%" }}>
      <MapComponent selectedLocation={selectedLocation} />
    </MapContainer>
  );
};

export default MapWrapper;
