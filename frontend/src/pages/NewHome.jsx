import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  MessageSquare, 
  FileText, 
  GraduationCap, 
  Users, 
  Phone, 
  MapPin, 
  Clock,
  ArrowRight,
  AlertTriangle,
  Home,
  HelpCircle,
  DollarSign,
  Shield,
  Calendar,
  Search
} from 'lucide-react';

const NewHome = () => {
  const navigate = useNavigate();
  const serviceCardsRef = useRef([]);

  useEffect(() => {
    // Add animation to service cards on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe service cards
    serviceCardsRef.current.forEach(card => {
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: MessageSquare,
      title: 'Interactive Q&A Guide',
      description: 'Answer a few simple questions to get personalized guidance and find exactly what you need for your case.',
      route: '/qna/divorce',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FileText,
      title: 'Find Court Forms',
      description: 'Search our comprehensive database of court forms with easy-to-understand instructions and examples.',
      route: '/forms',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: GraduationCap,
      title: 'Learn the Process',
      description: 'Step-by-step guides explaining court procedures, deadlines, and what to expect at each stage.',
      route: '/learn',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Users,
      title: 'Get Support',
      description: 'Connect with free legal aid, mediation services, and other community resources available to you.',
      route: '/contact',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const quickLinks = [
    {
      icon: Users,
      title: 'Child Custody',
      description: 'Forms and guidance for custody arrangements',
      route: '/qna/divorce'
    },
    {
      icon: DollarSign,
      title: 'Child Support',
      description: 'Calculate and modify support payments',
      route: '/qna/divorce'
    },
    {
      icon: FileText,
      title: 'Divorce Papers',
      description: 'Complete divorce filing process',
      route: '/qna/divorce'
    },
    {
      icon: Shield,
      title: 'Domestic Violence',
      description: 'Restraining orders and protection',
      route: '/qna/restraining'
    },
    {
      icon: Calendar,
      title: 'Court Hearings',
      description: 'Prepare for your court appearance',
      route: '/learn'
    },
    {
      icon: Search,
      title: 'Case Status',
      description: 'Check your case information online',
      route: '/services'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                <Scale className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-gray-800">Court Self-Help</div>
            </div>
            <nav className="hidden md:flex gap-8">
              {[
                { name: 'Home', route: '/' },
                { name: 'Services', route: '/services' },
                { name: 'Forms', route: '/forms' },
                { name: 'Get Help', route: '/contact' },
                { name: 'Information', route: '/learn' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.route)}
                  className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
            We're Here to Help You Navigate Family Court
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Get step-by-step guidance, find the right forms, and access the support you need to represent yourself in court with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('/qna/divorce')}
              className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/forms')}
              className="group bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all duration-300 border-2 border-white/30 backdrop-blur-sm transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <FileText className="w-5 h-5" />
              Browse Forms
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white relative -mt-8 rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-5 py-16">
          {/* Emergency Banner */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl mb-16 text-center animate-pulse">
            <div className="flex items-center justify-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Need Immediate Help?</h3>
            </div>
            <p className="text-lg">
              If you're facing domestic violence or need emergency protection,{' '}
              <strong>call 911</strong> or contact our emergency resources immediately.
            </p>
          </div>

          {/* Services Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
              How Can We Help You Today?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    ref={el => serviceCardsRef.current[index] = el}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => navigate(service.route)}
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      Get Started
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Links Section */}
          <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 -mx-5">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
              Popular Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.title}
                    onClick={() => navigate(link.route)}
                    className="group bg-white/10 p-6 rounded-2xl text-left text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold">{link.title}</h4>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed">{link.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-lg font-semibold mb-3">
            Superior Court of California - County of San Mateo
          </p>
          <p className="text-gray-300 mb-8">
            Providing accessible justice and support for all community members
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { name: 'Contact Us', route: '/contact' },
              { name: 'Hours & Location', route: '/contact' },
              { name: 'Accessibility', route: '/learn' },
              { name: 'Privacy Policy', route: '/services' },
              { name: 'Site Map', route: '/' }
            ].map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.route)}
                className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHome; 