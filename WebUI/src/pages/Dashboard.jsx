import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/sideBar/NavBar.jsx';
import CarSharing from '../components/carSharing/carSharing.jsx';
import SearchEngine from  '../components/searchCar/searchEngine.jsx';
import Usecase3 from '../components/usecase3/usecase3.jsx';
import Usecase4 from '../components/usecase4/Usecase4.jsx';
import Usecase5 from '../components/usecase5/Usecase5.jsx';
import '../styles/Dashboard.css';

function Dashboard() {

  return (
    <div className="Dashboard">
      <div className="main-section">
      <Navbar /> 
        <div className="main-container">
          <Routes>
            <Route path="/" element={<Navigate to="/searchEngine" />} />
            <Route path="/searchEngine" element={<SearchEngine />} />
            <Route path="/carSharing" element={<CarSharing />} />
            <Route path="/usecase3" element={<Usecase3 />} />
            <Route path="/usecase4" element={<Usecase4 />} />
            <Route path="/usecase5" element={<Usecase5 />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;