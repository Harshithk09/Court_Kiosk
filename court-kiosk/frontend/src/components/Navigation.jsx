import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoSeal from './LogoSeal';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation = () => {
  const location = useLocation();
  const { language } = useLanguage();

  // Hide chrome on immersive kiosk flows where pages already have their own header
  const hideOn = ['/admin', '/attorney'];
  if (hideOn.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  const navItems = [
    { path: '/', label: { en: 'Home', es: 'Inicio' } },
    { path: '/restraining-order', label: { en: 'Restraining Order', es: 'Orden de restricción' } },
    { path: '/divorce', label: { en: 'Divorce', es: 'Divorcio' } },
    { path: '/admin', label: { en: 'Staff', es: 'Personal' } },
  ];

  return (
    <nav className="bg-white/95 border-b border-slate-200 px-4 py-2.5 backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6 min-w-0">
            <div className="flex-shrink-0 flex items-center gap-2">
              <LogoSeal size="small" />
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-bold text-slate-900">
                  {language === 'es' ? 'Quiosco de Autoayuda' : 'Self-Help Kiosk'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {language === 'es' ? 'Corte Familiar · San Mateo' : 'Family Court · San Mateo'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const active =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label[language] || item.label.en}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block text-xs text-slate-500 font-medium">
            {language === 'es' ? 'Siga su camino paso a paso' : 'Follow your path step by step'}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
