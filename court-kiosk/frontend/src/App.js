import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { KioskModeProvider } from './contexts/KioskModeContext';

// Lazy-loaded pages/components to keep initial bundle light
const HomePage = lazy(() => import('./pages/HomePage'));
const ExperimentIndex = lazy(() => import('./pages/ExperimentIndex'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AttorneyDashboard = lazy(() => import('./components/AttorneyDashboard'));
const DVROPage = lazy(() => import('./pages/DVROPage'));
const CHROPage = lazy(() => import('./pages/CHROPage'));
const RestrainingOrderPage = lazy(() => import('./pages/RestrainingOrderPage'));
const RestrainingOrderTriagePage = lazy(() => import('./pages/RestrainingOrderTriagePage'));
const GVROPage = lazy(() => import('./pages/GVROPage'));
const WorkplaceViolencePage = lazy(() => import('./pages/WorkplaceViolencePage'));
const ElderAbusePage = lazy(() => import('./pages/ElderAbusePage'));
const DivorcePage = lazy(() => import('./pages/DivorcePage'));
const CustodyPage = lazy(() => import('./pages/CustodyPage'));
const OtherFamilyLawPage = lazy(() => import('./pages/OtherFamilyLawPage'));
const DivorceFlowRunner = lazy(() => import('./components/DivorceFlowRunner'));
const KioskMode = lazy(() => import('./pages/KioskMode'));

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <KioskModeProvider>
            <LanguageProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <div className="App">
                  <Navigation />
                  <ErrorBoundary>
                    <Suspense
                      fallback={
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading...</p>
                          </div>
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<HomePage />} />
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
                        <Route path="/restraining-order" element={<RestrainingOrderTriagePage />} />
                        <Route path="/gvro" element={<GVROPage />} />
                        <Route path="/workplace-violence" element={<WorkplaceViolencePage />} />
                        <Route path="/elder-abuse" element={<ElderAbusePage />} />
                        <Route path="/divorce" element={<DivorcePage />} />
                        <Route path="/custody" element={<CustodyPage />} />
                        <Route path="/other" element={<OtherFamilyLawPage />} />
                        <Route path="/divorce-flow" element={<DivorceFlowRunner />} />
                        <Route path="/kiosk" element={<KioskMode />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </Router>
            </LanguageProvider>
          </KioskModeProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App; 