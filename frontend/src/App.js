import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './contexts/LocationContext';
import QnA from './pages/QnA';
import Results from './pages/Results';
import CourtKiosk from './pages/CourtKiosk';
import Learn from './pages/Learn';
import Contact from './pages/Contact';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
  return (
    <LocationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<CourtKiosk />} />
            <Route path="/qna/:topicId" element={<QnA />} />
            <Route path="/results" element={<Results />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<ComingSoon />} />
            <Route path="/forms" element={<ComingSoon />} />
            <Route path="/self-help" element={<ComingSoon />} />
            <Route path="/divisions" element={<ComingSoon />} />
            <Route path="/info" element={<ComingSoon />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </LocationProvider>
  );
}

export default App; 