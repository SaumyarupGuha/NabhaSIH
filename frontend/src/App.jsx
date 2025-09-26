import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './i18n';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PatientDashboard from './pages/PatientDashboard';
import ConsultationsPage from './pages/ConsultationsPage';
import PharmaciesPage from './pages/PharmaciesPage';
import HospitalsPage from './pages/HospitalsPage';
import HospitalDashboard from './pages/HospitalDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacySignup from './pages/PharmacySignup';
import OrderTracking from './pages/OrderTracking';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
            <Route path="/pharmacy-signup" element={<PharmacySignup />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />

            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;