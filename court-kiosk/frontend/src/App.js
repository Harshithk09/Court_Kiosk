import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserKiosk from './pages/UserKiosk';
import ExperimentIndex from './pages/ExperimentIndex';
import AdminDashboard from './pages/AdminDashboard';
import DVROPage from './pages/DVROPage';
import DivorcePage from './pages/DivorcePage';
import DivorceFlowRunner from './components/DivorceFlowRunner';
import KioskMode from './pages/KioskMode';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <div className="App">
            <Navigation />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<UserKiosk />} />
                <Route path="/experiment" element={<ExperimentIndex />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dvro" element={<DVROPage />} />
                <Route path="/divorce" element={<DivorcePage />} />
                <Route path="/divorce-flow" element={<DivorceFlowRunner />} />
                <Route path="/kiosk" element={<KioskMode />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App; 