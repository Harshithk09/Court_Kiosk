import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserKiosk from './pages/UserKiosk';
import ExperimentIndex from './pages/ExperimentIndex';
import AdminDashboard from './pages/AdminDashboard';
import AttorneyDashboard from './components/AttorneyDashboard';
import DVROPage from './pages/DVROPage';
import CHROPage from './pages/CHROPage';
import DivorcePage from './pages/DivorcePage';
import DivorceFlowRunner from './components/DivorceFlowRunner';
import KioskMode from './pages/KioskMode';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="App">
              <Navigation />
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<UserKiosk />} />
                  <Route path="/experiment" element={<ExperimentIndex />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/attorney" element={<AttorneyDashboard />} />
                  <Route path="/dvro" element={<DVROPage />} />
                  <Route path="/chro" element={<CHROPage />} />
                  <Route path="/divorce" element={<DivorcePage />} />
                  <Route path="/divorce-flow" element={<DivorceFlowRunner />} />
                  <Route path="/kiosk" element={<KioskMode />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </div>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 