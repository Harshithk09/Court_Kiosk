import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Construction, 
  Clock, 
  ArrowRight, 
  Home,
  Wrench,
  CheckCircle,
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Phone,
  Calendar,
  Users,
  Zap,
  Star
} from 'lucide-react';

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 75) return prev;
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const features = [
    'Enhanced form filing system',
    'Real-time case status updates',
    'Online payment processing',
    'Document upload capabilities',
    'Virtual court appearances',
    'Mobile app integration',
    'AI-powered legal guidance',
    'Multi-language support'
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // Here you would typically send the email to your backend
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { icon: Twitter, name: 'Twitter', color: 'from-blue-400 to-blue-600' },
    { icon: Facebook, name: 'Facebook', color: 'from-blue-600 to-blue-800' },
    { icon: Instagram, name: 'Instagram', color: 'from-pink-500 to-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')} 
              className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-pulse"
            >
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Expected: Q1 2024</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
              <Construction className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              Coming Soon!
            </h1>
            <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
              This section is under construction and will be available soon. We're working hard to bring you enhanced court services.
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl p-10 mb-10 border border-green-100 animate-slide-in-left">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Progress</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full progress-animate"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-lg">{progress}% Complete</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-md card-hover">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Team Size</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-md card-hover">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Hours Worked</h3>
              <p className="text-2xl font-bold text-green-600">1,200+</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-md card-hover">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800">Features Planned</h3>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-10 mb-10">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-slide-in-left">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Development Status</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-shadow duration-300 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-semibold text-blue-800 text-lg">In Progress</span>
                </div>
                <p className="text-blue-700 text-lg leading-relaxed">
                  Our development team is actively working on this feature to provide you with the best possible experience.
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-shadow duration-300 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-semibold text-green-800 text-lg">Expected Launch</span>
                </div>
                <p className="text-green-700 text-lg leading-relaxed">
                  We expect to launch this feature within the next few months. Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100 hover:shadow-3xl transition-all duration-300 animate-slide-in-right">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Coming Features</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-gray-800 text-lg font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-10 mb-10 text-white shadow-2xl animate-scale-in">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-purple-100 text-xl mb-8 leading-relaxed">
              Get notified when this feature launches and receive updates about new court services.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
                  required
                />
                <button
                  type="submit"
                  className="group bg-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center btn-pulse"
                >
                  {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 mb-10 text-white shadow-2xl animate-scale-in">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">What's Available Now?</h2>
            <p className="text-blue-100 text-xl mb-8 leading-relaxed">
              While this feature is being developed, you can still access our current self-help tools and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/qna/divorce')}
                className="group bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center btn-pulse"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Q&A Tool
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center btn-pulse"
              >
                Browse FAQs
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-10 border border-gray-100 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect With Us</h2>
            <p className="text-gray-600 text-lg">Follow us for updates and stay connected with the court community.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Social Media */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={social.name}
                      className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 card-hover`}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">(650) 261-5100</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">selfhelp@sanmateocourt.org</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Mon-Fri: 8:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 