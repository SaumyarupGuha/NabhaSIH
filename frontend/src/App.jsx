import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LoadingProvider } from './context/LoadingContext';
import { Skeleton } from './components/ui/Skeleton';
import './i18n';

// Lazy load all pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const PatientDashboard = React.lazy(() => import('./pages/PatientDashboard'));
const ConsultationsPage = React.lazy(() => import('./pages/ConsultationsPage'));
const PharmaciesPage = React.lazy(() => import('./pages/PharmaciesPage'));
const HospitalsPage = React.lazy(() => import('./pages/HospitalsPage'));
const HospitalDashboard = React.lazy(() => import('./pages/HospitalDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const VideoCall = React.lazy(() => import('./components/VideoCall'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);


function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/patient" element={<PatientDashboard />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/pharmacies" element={<PharmaciesPage />} />
                <Route path="/hospitals" element={<HospitalsPage />} />
                <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
                <Route path="/video-room/:roomId" element={<VideoCall />} />
                <Route path="/pharmacy-dashboard" element={<div>Pharmacy Dashboard</div>} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;