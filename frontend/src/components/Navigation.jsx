import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', description: 'Main kiosk interface' },
    { path: '/kiosk', label: 'Kiosk Mode', description: 'Guided assistance mode' },
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
          
          <div className="text-xs text-gray-500">
            Enhanced DVRO System
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
