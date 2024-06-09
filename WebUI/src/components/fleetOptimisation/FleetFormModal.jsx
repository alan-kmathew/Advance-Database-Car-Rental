import React, { useState } from "react";
import Modal from "react-modal";
import Select from "react-select";
import axios from "axios";
import "../../styles/FleetFormModal.css";

const FleetFormModal = ({
  show,
  onClose,
  allServicePoints,
  selectedNearestStation,
  setShortestRouteDetails,
  setOptimizationDetails,
}) => {
  const [formGroups, setFormGroups] = useState([
    { id: 1, selectedCars: [], selectedServiceStation: null },
  ]);

  const serviceOptions = allServicePoints.map((point) => ({
    value: point.id,
    label: point.name,
  }));

  const handleOptimiseBtnClick = async (e) => {
    e.preventDefault();
    const toLocations = formGroups
      .map((group) => group.selectedServiceStation?.label)
      .filter(Boolean);

    const selectedStations = formGroups.map((group) => ({
      id: group.selectedServiceStation?.value,
      name: group.selectedServiceStation?.label,
      cars: group.selectedCars,
    }));

    try {
      let shortestPathResult;
      if (formGroups.length === 1) {
        const response = await axios.get(
          "http://localhost:8020/api/car/get/shortestPath",
          {
            params: {
              fromLocation: selectedNearestStation.locatedInCity,
              toLocation: toLocations[0],
            },
          }
        );
        shortestPathResult = response.data.map((path) => ({
          routeDetails: path.routeDetails,
          totalDistance: path.totalDistance,
        }));
      } else {
        const response = await axios.post(
          "http://localhost:8020/api/car/shortestPath",
          {
            cityLists: [selectedNearestStation.locatedInCity, ...toLocations],
          }
        );
        shortestPathResult = response.data.map((path) => ({
          routeDetails: path.routeDetails,
          totalDistance: path.totalDistanceInMiles,
        }));
      }
      setShortestRouteDetails(shortestPathResult);
      setOptimizationDetails({
        fromStation: selectedNearestStation.locatedInCity,
        selectedStations,
      });

      // Construct the request body for the additional POST API call
      const requestBody = {
        fromStation: selectedNearestStation.serviceStationID,
        deliveryStations: selectedStations.map((station) => ({
          stationId: station.id,
          carListToDeliver: station.cars.map((car) => car.value),
        })),
      };

      // Make the POST request to the specified endpoint
      await axios.post(
        "http://localhost:8020/api/car/fleet/optimise",
        requestBody
      );

      onClose();
    } catch (error) {
      console.error("Error fetching route details or optimizing fleet:", error);
    }
  };

  const addFormGroup = () => {
    setFormGroups([
      ...formGroups,
      {
        id: formGroups.length + 1,
        selectedCars: [],
        selectedServiceStation: null,
      },
    ]);
  };

  const removeFormGroup = (id) => {
    setFormGroups(formGroups.filter((group) => group.id !== id));
  };

  const handleCarSelection = (selectedOptions, groupId) => {
    setFormGroups(
      formGroups.map((group) =>
        group.id === groupId
          ? { ...group, selectedCars: selectedOptions }
          : group
      )
    );
  };

  const handleServiceStationChangeLocal = (selectedOption, groupId) => {
    setFormGroups(
      formGroups.map((group) =>
        group.id === groupId
          ? { ...group, selectedServiceStation: selectedOption }
          : group
      )
    );
  };

  const getFilteredCarOptions = (groupId) => {
    const selectedCarIds = formGroups
      .filter((group) => group.id !== groupId)
      .flatMap((group) => group.selectedCars.map((car) => car.value));

    return selectedNearestStation.carList
      .filter((car) => !selectedCarIds.includes(car._id))
      .map((car) => ({
        value: car._id,
        label: car.model,
      }));
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      className="fleet-modal-content"
      overlayClassName="fleet-modal-overlay"
      contentLabel="Fleet Modal"
    >
      <button onClick={onClose} className="fleet-modal-close-btn">
        ✕
      </button>
      <h2>Service Station Optimisation Form</h2>
      <div className="fleet-modal-body">
        {formGroups.map((group, index) => (
          <div key={group.id} className="fleet-form-group-wrapper">
            <div className="fleet-form-group">
              <label htmlFor={`serviceStation-${group.id}`}>
                Service Station
              </label>
              <Select
                id={`serviceStation-${group.id}`}
                options={serviceOptions}
                onChange={(selectedOption) =>
                  handleServiceStationChangeLocal(selectedOption, group.id)
                }
                value={group.selectedServiceStation}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div className="fleet-form-group">
              <label htmlFor={`carList-${group.id}`}>Car List</label>
              <Select
                id={`carList-${group.id}`}
                isMulti
                options={getFilteredCarOptions(group.id)}
                onChange={(selectedOptions) =>
                  handleCarSelection(selectedOptions, group.id)
                }
                value={group.selectedCars}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            {index > 0 && (
              <button
                className="fleet-modal-remove-btn"
                style={{ fontSize: "15px" }}
                onClick={() => removeFormGroup(group.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="fleet-modal-buttons">
        <button className="fleet-modal-add-btn" onClick={addFormGroup}>
          Add More
        </button>
        <button
          className="fleet-modal-optimise-btn"
          onClick={handleOptimiseBtnClick}
        >
          Optimise
        </button>
      </div>
    </Modal>
  );
};

export default FleetFormModal;
