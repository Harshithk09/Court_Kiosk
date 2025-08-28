import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { language } = useLanguage();

  const navItems = [
    { path: '/', label: 'Home', description: 'Main kiosk interface' },
    { path: '/dvro', label: 'DVRO Flow', description: 'Original DVRO flow' },
    { path: '/dvro-flow', label: 'Flow Runner', description: 'Interactive flow runner' },
    { path: '/admin', label: 'Admin', description: 'Administrative dashboard' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={item.description}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              Enhanced DVRO System
            </div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {language === 'en' ? 'Welcome,' : 'Bienvenido,'} {user?.name || user?.username}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  {language === 'en' ? 'Logout' : 'Cerrar Sesión'}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                {language === 'en' ? 'Admin Login' : 'Acceso Admin'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
