// PassengerForm.jsx
import React, { useState } from 'react';
import '../../styles/passenger.css';

const PassengerForm = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    fromDate: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let errors = {};
    if (!formData.source) errors.source = 'Source is required';
    if (!formData.destination) errors.destination = 'Destination is required';
    if (!formData.fromDate) errors.fromDate = 'From date is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted', formData);
      // Handle form submission logic here
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form className="passenger-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="source">Source:</label>
        <input
          type="text"
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
        />
        {errors.source && <span className="error">{errors.source}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="destination">Destination:</label>
        <input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
        />
        {errors.destination && <span className="error">{errors.destination}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="fromDate">Travel Date</label>
        <input
          type="date"
          id="fromDate"
          name="fromDate"
          value={formData.fromDate}
          onChange={handleChange}
        />
        {errors.fromDate && <span className="error">{errors.fromDate}</span>}
      </div>
     
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  );
};

export default PassengerForm;
