import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import SoftwarePage from './pages/SoftwarePage';
import ServicesPage from './pages/ServicesPage';
import SelfStudyPage from './pages/services/SelfStudyPage';
import PrivateTutoringPage from './pages/services/PrivateTutoringPage';
import BootcampPage from './pages/services/BootcampPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#4CAF50',
                },
              },
              error: {
                style: {
                  background: '#dc3545',
                },
              },
            }}
          />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/software" element={<SoftwarePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/self-study" element={<SelfStudyPage />} />
              <Route path="/services/private-tutoring" element={<PrivateTutoringPage />} />
              <Route path="/services/bootcamp" element={<BootcampPage />} />
              <Route path="/learn-to-trade" element={<ServicesPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/contact" element={<div className="page-placeholder">Contact Page Coming Soon</div>} />
              <Route path="/tutoring" element={<div className="page-placeholder">Tutoring Page Coming Soon</div>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
