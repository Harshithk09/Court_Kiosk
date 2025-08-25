import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import LogoAlt from '../components/LogoAlt';
import LogoSeal from '../components/LogoSeal';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const LogoDemo = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedLogo, setSelectedLogo] = useState('scales');

  const logoOptions = [
    {
      id: 'scales',
      name: { en: 'Scales of Justice', es: 'Balanza de Justicia' },
      description: { 
        en: 'Traditional scales of justice design with blue background and gold accents. Represents fairness and legal authority.',
        es: 'Diseño tradicional de balanza de justicia con fondo azul y acentos dorados. Representa equidad y autoridad legal.'
      },
      component: Logo,
      variant: 'primary'
    },
    {
      id: 'courthouse',
      name: { en: 'Modern Courthouse', es: 'Palacio de Justicia Moderno' },
      description: { 
        en: 'Modern courthouse building design with clean lines. Professional and contemporary government style.',
        es: 'Diseño moderno de palacio de justicia con líneas limpias. Estilo gubernamental profesional y contemporáneo.'
      },
      component: LogoAlt,
      variant: 'government'
    },
    {
      id: 'seal',
      name: { en: 'Government Seal', es: 'Sello Gubernamental' },
      description: { 
        en: 'Traditional government seal style with concentric rings and official appearance. Most formal and authoritative.',
        es: 'Estilo tradicional de sello gubernamental con anillos concéntricos y apariencia oficial. Más formal y autoritario.'
      },
      component: LogoSeal,
      variant: 'primary'
    }
  ];

  const handleLogoSelection = (logoId) => {
    setSelectedLogo(logoId);
  };

  const handleConfirmSelection = () => {
    // Here you would typically save the selection to your app's state/context
    // For now, we'll just navigate back to the main kiosk
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {language === 'es' ? 'Volver' : 'Back'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'es' ? 'Seleccionar Logo' : 'Logo Selection'}
              </h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {language === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Elija el Logo para el Kiosko' : 'Choose the Kiosk Logo'}
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Seleccione el diseño de logo que mejor represente al Condado de San Mateo y el sistema de kiosko de ayuda legal.'
              : 'Select the logo design that best represents San Mateo County and the court self-help kiosk system.'
            }
          </p>
        </div>

        {/* Logo Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {logoOptions.map((option) => {
            const LogoComponent = option.component;
            const isSelected = selectedLogo === option.id;
            
            return (
              <div
                key={option.id}
                onClick={() => handleLogoSelection(option.id)}
                className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer hover:shadow-lg ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  {/* Logo Display */}
                  <div className="flex justify-center mb-4">
                    <LogoComponent 
                      size="large" 
                      variant={option.variant}
                      className="justify-center"
                    />
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex justify-center mb-4">
                      <div className="flex items-center text-blue-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          {language === 'es' ? 'Seleccionado' : 'Selected'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Logo Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {option.name[language]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {option.description[language]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {language === 'es' ? 'Variaciones de Tamaño' : 'Size Variations'}
          </h3>
          <div className="flex items-center justify-center space-x-8">
            {logoOptions.map((option) => {
              if (option.id === selectedLogo) {
                const LogoComponent = option.component;
                return (
                  <div key={option.id} className="text-center">
                    <LogoComponent size="small" variant={option.variant} />
                    <span className="text-xs text-gray-500 mt-2 block">Small</span>
                  </div>
                );
              }
              return null;
            })}
            {logoOptions.map((option) => {
              if (option.id === selectedLogo) {
                const LogoComponent = option.component;
                return (
                  <div key={option.id} className="text-center">
                    <LogoComponent size="default" variant={option.variant} />
                    <span className="text-xs text-gray-500 mt-2 block">Default</span>
                  </div>
                );
              }
              return null;
            })}
            {logoOptions.map((option) => {
              if (option.id === selectedLogo) {
                const LogoComponent = option.component;
                return (
                  <div key={option.id} className="text-center">
                    <LogoComponent size="large" variant={option.variant} />
                    <span className="text-xs text-gray-500 mt-2 block">Large</span>
                  </div>
                );
              }
              return null;
            })}
            {logoOptions.map((option) => {
              if (option.id === selectedLogo) {
                const LogoComponent = option.component;
                return (
                  <div key={option.id} className="text-center">
                    <LogoComponent size="xlarge" variant={option.variant} />
                    <span className="text-xs text-gray-500 mt-2 block">X-Large</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirmSelection}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'es' ? 'Confirmar Selección' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoDemo; 