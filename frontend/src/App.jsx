import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GiveawayHome from './pages/Giveaway/GiveawayHome';
import GiveawayDetails from './pages/GiveawayDetails/GiveawayDetails';
import GiveawayWinners from './pages/GiveawayWinners/GiveawayWinners';
import TopNavbar from './components/TopNavbar';
import Footer from './components/Footer/Footer';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

import UserGiveaways from './pages/Profile/UserGiveaways';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <TopNavbar />
          <Routes>
            <Route path="/" element={<Navigate to="/giveaways" replace />} />
            <Route path="/giveaways" element={<GiveawayHome />} />
            <Route path="/giveaways/:giveawayId/prize/:prizeId" element={<GiveawayDetails />} />
            <Route path="/giveaways/:giveawayId/winners" element={<GiveawayWinners />} />
            <Route path="/profile/giveaways" element={<UserGiveaways />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
