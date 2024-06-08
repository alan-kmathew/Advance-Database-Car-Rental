// DetailsModal.js
import React from "react";
import "../../styles/DetailsModal.css";

const DetailsModal = ({ info, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>{info.name || info.servicePointName}</h2>
        <img
          src={info.servicePointImage || info.image}
          alt={info.name || info.servicePointName}
          style={{ width: "100%", height: "auto" }}
        />
        <p>
          <strong>Total Cars Available:</strong> {info.totalCarsAvailable}
        </p>
        <p>
          <strong>Total Bookings:</strong> {info.totalBookings}
        </p>
        <p>
          <strong>Cars:</strong>
        </p>
        <ul>
          {info.carList &&
            info.carList.map((car) => (
              <li key={car._id}>
                {car.model} - {car.plateNo}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default DetailsModal;
