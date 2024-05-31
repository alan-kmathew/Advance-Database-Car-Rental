// CustomDropdown.jsx
import React, { useState } from 'react';
import '../styles/CustomDropdown.css';

const CustomDropdown = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option, event) => {
    event.stopPropagation(); // Stop event propagation
    setSelectedOption(option);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className="custom-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? (
          <>
            <img src={selectedOption.image} alt={selectedOption.name} />
            <span>{selectedOption.name} - {selectedOption.seats} seats</span>
          </>
        ) : (
          <span>Select a car</span>
        )}
      </div>
      {isOpen && (
        <div className="options">
          {options.map((option, index) => (
            <div key={index} className="option" onClick={(e) => handleSelect(option, e)}>
              <img src={option.image} alt={option.name} />
              <span>{option.name} - {option.seats} seats</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
