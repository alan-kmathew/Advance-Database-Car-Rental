import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/sideBar/NavBar.jsx';
import CarSharing from '../components/carSharing/carSharing.jsx';
import SearchEngine from  '../components/searchCar/searchEngine.jsx';
import '../styles/UserDashboard.css';

function UserDashboard() {

  return (
    <div className="UserDashboard">
      <div className="main-section">
      <Navbar /> 
        <div className="main-container">
          <Routes>
            <Route path="/" element={<Navigate to="/searchEngine" />} />
            <Route path="/searchEngine" element={<SearchEngine />} />
            <Route path="/carSharing" element={<CarSharing />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;