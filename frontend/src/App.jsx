import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './i18n';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PatientDashboard from './pages/PatientDashboard';
import ConsultationsPage from './pages/ConsultationsPage';
import PharmaciesPage from './pages/PharmaciesPage';
import HospitalsPage from './pages/HospitalsPage';
import HospitalDashboard from './pages/HospitalDashboard';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  return (
    <AuthProvider>
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
            <Route path="/pharmacy-dashboard" element={<div>Pharmacy Dashboard</div>} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;