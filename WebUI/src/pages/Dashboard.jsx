import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/sideBar/NavBar.jsx';
import Passenger from '../components/Passenger/Passenger.jsx';
import SearchEngine from  '../components/searchCar/searchEngine.jsx';
import Usecase5 from '../components/usecase5/Usecase5.jsx';
import '../styles/Dashboard.css';
import EventBooking from '../components/eventBooking/EventBooking.jsx';
import FleetOpt from '../components/fleetOptimisation/FleetOpt.jsx';


function Dashboard() {

  return (
    <div className="Dashboard">
      <div className="main-section">
      <Navbar /> 
        <div className="main-container">
          <Routes>
            <Route path="/" element={<Navigate to="/searchEngine" />} />
            <Route path="/searchEngine" element={<SearchEngine />} />
            <Route path="/passenger" element={<Passenger />} />
            <Route path="/eventBooking" element={<EventBooking />} />
            <Route path="/fleetopt" element={<FleetOpt />} />
            <Route path="/usecase5" element={<Usecase5 />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;