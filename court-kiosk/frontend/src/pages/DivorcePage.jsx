import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Clock, Home } from 'lucide-react';

const DivorcePage = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleStartApplication = () => {
    navigate('/divorce-flow');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Family Court Clinic</span>
              </div>

              <button
                onClick={toggleLanguage}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Title */}
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Divorce & Legal Separation
          </h1>
          
          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get help with divorce proceedings, legal separation, and property division. 
            We'll guide you step by step with information and specific forms needed for your case.
          </p>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div className="text-left">
                <p className="text-blue-800 font-medium">
                  Understanding your rights and the divorce process is crucial. 
                  This guide will help you navigate the legal requirements and prepare the necessary documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <button
            onClick={handleStartApplication}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-6 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center mx-auto mb-6"
          >
            <Shield className="w-6 h-6 mr-3" />
            Start Divorce Guide
          </button>

          {/* Additional Information */}
          <div className="text-gray-500 text-sm">
            <div className="flex items-center justify-center space-x-6">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Free and confidential
              </span>
              <span>•</span>
              <span>20-30 minutes</span>
              <span>•</span>
              <span>Step-by-step guidance</span>
            </div>
          </div>
        </div>

        {/* What You'll Learn Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            What You'll Learn
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Residency Requirements</h3>
              <p className="text-gray-600">
                Understand California's residency requirements and eligibility for filing divorce proceedings.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Required Forms</h3>
              <p className="text-gray-600">
                Learn about essential forms like FL-100 (Petition), FL-110 (Summons), and child custody forms if applicable.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Service Requirements</h3>
              <p className="text-gray-600">
                Understand how to properly serve divorce papers to your spouse within the required timeframe.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
              <p className="text-gray-600">
                Get guidance on what happens after filing, including response periods and court procedures.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-3">Important Information</h3>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li>• This guide provides general information and is not legal advice</li>
            <li>• For complex cases or legal advice, consult with an attorney</li>
            <li>• Court staff can help with procedural questions but cannot provide legal advice</li>
            <li>• All forms and procedures must comply with California family law requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DivorcePage;


