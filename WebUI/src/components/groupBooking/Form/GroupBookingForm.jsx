import { useEffect, useState } from "react";
import "./GroupBookingForm.css";
import Select from "react-select";
import { carTypeOptions, options } from "./optionsHelper";
import { getRentPlan } from "./helper";

const BASE_API = "http://localhost:8020/api/car/";

const GroupBookingForm = ({ setPlan }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [requirements, setRequirements] = useState([
    { city: "", carsNeeded: 1 },
  ]);
  const [carType, setCarType] = useState("");

  const handleRequirementCityChange = (index, city) => {
    setRequirements(
      requirements.map((r, i) => {
        if (i == index) return { city: city, carsNeeded: r.carsNeeded };
        else return r;
      })
    );
  };

  const handleRequirementCarsCountChange = (index, carsCount) => {
    setRequirements(
      requirements.map((r, i) => {
        if (i == index) return { city: r.city, carsNeeded: carsCount };
        else return r;
      })
    );
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((r, i) => i != index));
  };

  return (
    <form>
      <label>From Date:</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        required
      />
      <label>To Date:</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        required
      />
      <label>Cities & Cars</label>
      <div className="CityCountInputContainer">
        {requirements.map((r, i) => (
          <div key={i}>
            <Select
              options={options}
              onChange={(newOption) =>
                handleRequirementCityChange(i, newOption.value)
              }
              defaultInputValue={r.city}
            />
            <input
              type="number"
              min={1}
              defaultValue={r.carsNeeded}
              onChange={(e) =>
                handleRequirementCarsCountChange(i, e.target.value)
              }
            />
            {i > 0 && (
              <p
                className="removeCityCount"
                onClick={(e) => {
                  removeRequirement(i);
                }}
              >
                ❌
              </p>
            )}
          </div>
        ))}
        <div
          className="addRequirement"
          onClick={() => {
            setRequirements([...requirements, { city: "", carsNeeded: 1 }]);
          }}
        >
          <p>Add City</p>
        </div>
      </div>

      <label>Car Type</label>
      <Select
        options={carTypeOptions}
        onChange={(newOption) => setCarType(newOption.value)}
      />
      <div
        className="submitButton"
        onClick={() => {
          getRentPlan(requirements, carType, setPlan);
        }}
      >
        Find Cars
      </div>
    </form>
  );
};

export default GroupBookingForm;
