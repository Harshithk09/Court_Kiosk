import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserKiosk from './pages/UserKiosk';
import AdminDashboard from './pages/AdminDashboard';
import DVROPage from './pages/DVROPage';
import DivorcePage from './pages/DivorcePage';
import DivorceFlowRunner from './components/DivorceFlowRunner';
import KioskMode from './pages/KioskMode';
import Navigation from './components/Navigation';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<UserKiosk />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dvro" element={<DVROPage />} />
            <Route path="/divorce" element={<DivorcePage />} />
            <Route path="/divorce-flow" element={<DivorceFlowRunner />} />
            <Route path="/kiosk" element={<KioskMode />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App; 