import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import MainLogo from '../../Assets/main-logo.png';
import carSearch from '../../Assets/car-check.png';
import carSharing from '../../Assets/car-sharing.png';
import '../../styles/Navbar.css'; 

const originalMenuItems = [
  { title: 'Rent a Car', icon: carSearch, path: '/searchEngine' },
  { title: 'Car Sharing', icon: carSharing, path: '/carSharing' },
];

const newMenuItems = [
  { title: 'Use Case 3', icon: carSearch, path: '/usecase3' },
  { title: 'Use Case 4', icon: carSharing, path: '/usecase4' },
  { title: 'Use Case 5', icon: carSearch, path: '/usecase5' },
];

function Navbar() {
  const [menuItems, setMenuItems] = useState(originalMenuItems);
  const [buttonText, setButtonText] = useState('User Dashboard');
  const navigate = useNavigate();

  const toggleMenu = () => {
    const newItems = menuItems === originalMenuItems ? newMenuItems : originalMenuItems;
    setMenuItems(newItems);
    setButtonText(buttonText === 'User Dashboard' ? 'Agent Dashboard' : 'User Dashboard');
    navigate(newItems[0].path); 
  };

  return (
    <div className="navbar">
      <div className="project-details">
        <img src={MainLogo} alt="Project" className="project-icon" />
      </div>
      <div className="nav-items">
        {menuItems.map(({ title, icon, path }) => (
          <NavLink
            key={title}
            to={path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <img src={icon} alt={title} className="menu-icon" />
            {title}
          </NavLink>
        ))}
      </div>
      <button onClick={toggleMenu} className="toggle-button">{buttonText}</button>
    </div>
  );
}

export default Navbar;
