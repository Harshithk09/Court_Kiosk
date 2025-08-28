import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserKiosk from './pages/UserKiosk';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import DVROPage from './pages/DVROPage';
import DVFlowRunnerPage from './pages/DVFlowRunnerPage';
import KioskMode from './pages/KioskMode';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<UserKiosk />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/dvro" element={<DVROPage />} />
              <Route path="/dvro-flow" element={<DVFlowRunnerPage />} />
              <Route path="/kiosk" element={<KioskMode />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App; 