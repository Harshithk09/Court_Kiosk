import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoSeal from './LogoSeal';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Navigation = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = useMemo(() => ([
    {
      path: '/',
      label: t('navigation.home'),
      description: t('navigation.homeDescription')
    },
    {
      path: '/dvro',
      label: t('navigation.dvroFlow'),
      description: t('navigation.dvroDescription')
    },
    {
      path: '/divorce',
      label: t('navigation.divorceFlow'),
      description: t('navigation.divorceDescription')
    },
    {
      path: '/admin',
      label: t('navigation.admin'),
      description: t('navigation.adminDescription')
    },
    {
      path: '/attorney',
      label: t('navigation.attorney'),
      description: t('navigation.attorneyDescription')
    }
  ]), [t]);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation Items */}
          <div className="flex items-center space-x-8">
            {/* Court Logo */}
            <div className="flex-shrink-0">
              <LogoSeal size="small" />
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
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
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector size="sm" />
            <div className="text-xs text-gray-500">
              {t('navigation.footerTagline')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
