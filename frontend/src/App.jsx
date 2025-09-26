import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./i18n";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PatientDashboard from "./pages/PatientDashboard";
import PatientDashboardTest from "./pages/PatientDashboardTest";
import PatientDashboardSimple from "./pages/PatientDashboardSimple";
import ConsultationsPage from "./pages/ConsultationsPage";
import PharmaciesPage from "./pages/PharmaciesPage";
import HospitalsPage from "./pages/HospitalsPage";
import HospitalDashboard from "./pages/HospitalDashboard";
import VideoCall from "./components/VideoCall";
import DoctorConsultationsPage from "./pages/DoctorConsultationsPage";

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
              <Route path="/patient" element={<PatientDashboardSimple />} />
              <Route path="/patient-simple" element={<PatientDashboardSimple />} />
              <Route path="/patient-test" element={<PatientDashboardTest />} />
              <Route path="/consultations" element={<ConsultationsPage />} />
              <Route path="/pharmacies" element={<PharmaciesPage />} />
              <Route path="/hospitals" element={<HospitalsPage />} />
              <Route
                path="/hospital-dashboard"
                element={<HospitalDashboard />}
              />
              <Route path="/video-room/:roomId" element={<VideoCall />} />
              <Route
                path="/doctor-consultations"
                element={<DoctorConsultationsPage />}
              />
              <Route
                path="/pharmacy-dashboard"
                element={<div>Pharmacy Dashboard</div>}
              />
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
