import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <UserDashboard />
      </div>
    </Router>
  );
}

export default App;


