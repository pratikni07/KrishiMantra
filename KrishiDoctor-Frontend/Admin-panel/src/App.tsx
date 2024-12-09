import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import SideBar from './components/SideBar';
import DoctorLogin from './Pages/DoctorLogin';
import Crops from './Pages/Crops';

function App() {
  const location = useLocation();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conditionally render sidebar */}
      {(location.pathname !== '/login' && location.pathname !== '/doctorlogin') && <SideBar />
      }
      
      {/* Content area with independent scrolling */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/doctorlogin" element={<DoctorLogin />} />
          <Route path="/" element={<Home />} />
          <Route path="/crops" element={<Crops />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;