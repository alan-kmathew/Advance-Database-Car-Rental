import React, { useState, useEffect, useRef } from 'react';
import '../styles/CustomDropdown.css';

const CustomDropdown = ({ options, onSelect }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSelect = (option) => {
    const isSelected = selectedOptions.some((selected) => selected.value === option.value);
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter((selected) => selected.value !== option.value));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
    onSelect([...selectedOptions, option]);
  };

  const toggleOption = (option) => {
    handleSelect(option);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
        {selectedOptions.length > 0 ? (
          <span>{selectedOptions.map((option) => option.label).join(', ')}</span>
        ) : (
          <span>Select destinations</span>
        )}
      </div>
      {isOpen && (
        <div className="options">
          {options.map((option, index) => (
            <div
              key={index}
              className={`option ${selectedOptions.some((selected) => selected.value === option.value) ? 'selected' : ''}`}
              onClick={() => toggleOption(option)}
            >
              <input
                type="checkbox"
                checked={selectedOptions.some((selected) => selected.value === option.value)}
                readOnly
              />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;