import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserKiosk from './pages/UserKiosk';
import AdminDashboard from './pages/AdminDashboard';
import DVROPage from './pages/DVROPage';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<UserKiosk />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dvro" element={<DVROPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App; 