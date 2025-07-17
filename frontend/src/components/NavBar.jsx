import React from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Online Services', path: '/services' },
  { name: 'Forms & Filing', path: '/forms' },
  { name: 'Self-Help', path: '/self-help' },
  { name: 'Divisions', path: '/divisions' },
  { name: 'General Information', path: '/info' },
];

const NavBar = () => {
  return (
    <nav className="bg-white border-b-2 border-blue-900 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          {/* Placeholder for logo */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-blue-900">SM</span>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Superior Court of California</div>
            <div className="text-lg md:text-2xl font-bold text-blue-900 leading-tight">County of San Mateo</div>
          </div>
        </div>
        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className="text-blue-900 font-medium hover:text-blue-600 transition-colors px-2 py-1 rounded"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 