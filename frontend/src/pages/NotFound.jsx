import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ArrowRight, 
  AlertTriangle,
  MapPin,
  HelpCircle
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { title: 'Start Q&A Tool', route: '/qna/divorce', icon: HelpCircle },
    { title: 'Browse FAQs', route: '/learn', icon: Search },
    { title: 'Contact Court', route: '/contact', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-8xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Page Not Found</h2>
            <p className="text-gray-700 text-xl leading-relaxed max-w-2xl mx-auto">
              Sorry, the page you are looking for does not exist. Let us help you find what you need.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 mb-10 border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Pages</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(link.route)}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center w-full transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{link.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Back to Home</h2>
            <p className="text-blue-100 text-xl mb-8 leading-relaxed">
              Return to our homepage to explore all available services and resources.
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="group bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center mx-auto"
            >
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Return Home
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 