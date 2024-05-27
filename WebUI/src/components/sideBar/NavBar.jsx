import React from 'react';
import { NavLink } from 'react-router-dom';
import MainLogo from '../../Assets/main-logo.png';
import carSearch from '../../Assets/car-check.png';
import CarSharing from '../../Assets/car-sharing.png';
import '../../styles/Navbar.css'; 

const menuItems = [
  { title: 'Rent a Car', icon: carSearch, path: '/searchEngine' },
  { title: 'Car Sharing', icon: CarSharing, path: '/carSharing' },
];

function Navbar () {
  return (
    <div className="navbar">
      <div className="project-details">
        <img src={MainLogo} alt="Project" className="project-icon" />
      </div>
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
  );
}

export default Navbar;