import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ options, selectedOptions, onSelectionChange, label }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionChange = (event) => {
    const { value } = event.target;
    onSelectionChange(value);
  };

  return (
    <div className="input-group" ref={dropdownRef}>
      <label>{label}</label>
      <div className="custom-dropdown" onClick={handleDropdownToggle}>
        {selectedOptions.length === 0 ? "Select destinations" : selectedOptions.join(", ")}
      </div>
      {dropdownOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <label key={index} className="checkbox-label">
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={handleOptionChange}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

