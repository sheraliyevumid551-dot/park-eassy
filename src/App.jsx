import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FindParking from './pages/FindParking';
import MyBookings from './pages/MyBookings';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="app-container">
      {/* Glowing Background Blobs */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      
      {/* Navigation */}
      <Navbar />

      {/* Main Pages */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<FindParking />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
