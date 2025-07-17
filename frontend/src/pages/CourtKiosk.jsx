import React, { useEffect, useRef } from 'react';
import {
  Scale,
  MessageSquare,
  FileText,
  GraduationCap,
  Users,
  ArrowRight,
  AlertTriangle,
  DollarSign,
  Shield,
  Calendar,
  Search
} from 'lucide-react';

const CourtKiosk = () => {
  const serviceCardsRef = useRef([]);

  useEffect(() => {
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
    serviceCardsRef.current.forEach(card => {
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.4,0,.2,1)';
        observer.observe(card);
      }
    });
    return () => observer.disconnect();
  }, []);

  const navigate = (route) => {
    window.location.href = route;
  };

  const services = [
    {
      icon: MessageSquare,
      title: 'Interactive Q&A System',
      description: 'Answer guided questions to receive personalized legal guidance tailored to your specific case and circumstances.',
      route: '/qna/divorce',
      color: 'from-amber-400 to-yellow-500'
    },
    {
      icon: FileText,
      title: 'Court Forms & Documents',
      description: 'Access official court forms with detailed instructions and examples to complete your legal documentation.',
      route: '/forms',
      color: 'from-blue-700 to-blue-900'
    },
    {
      icon: GraduationCap,
      title: 'Legal Process Education',
      description: 'Comprehensive guides explaining court procedures, legal requirements, and what to expect during proceedings.',
      route: '/learn',
      color: 'from-slate-600 to-slate-800'
    },
    {
      icon: Users,
      title: 'Support Services',
      description: 'Connect with legal aid organizations, mediation services, and community resources in San Mateo County.',
      route: '/contact',
      color: 'from-emerald-500 to-emerald-700'
    }
  ];

  const quickLinks = [
    {
      icon: Users,
      title: 'Child Custody & Visitation',
      description: 'Custody arrangements and parenting plans',
      route: '/qna/divorce',
      color: 'bg-blue-700'
    },
    {
      icon: DollarSign,
      title: 'Child Support Services',
      description: 'Support calculations and modifications',
      route: '/qna/divorce',
      color: 'bg-amber-500'
    },
    {
      icon: FileText,
      title: 'Divorce & Separation',
      description: 'Dissolution of marriage proceedings',
      route: '/qna/divorce',
      color: 'bg-slate-700'
    },
    {
      icon: Shield,
      title: 'Domestic Violence Protection',
      description: 'Restraining orders and safety resources',
      route: '/qna/restraining',
      color: 'bg-red-600'
    },
    {
      icon: Calendar,
      title: 'Court Appearance Prep',
      description: 'Guidance for your court hearing',
      route: '/learn',
      color: 'bg-emerald-600'
    },
    {
      icon: Search,
      title: 'Case Information',
      description: 'Check case status and schedules',
      route: '/services',
      color: 'bg-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Scale className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">San Mateo County Court</div>
                <div className="text-xs md:text-sm text-slate-500">Self-Help Services</div>
              </div>
            </div>
            <nav className="hidden md:flex gap-4 lg:gap-6">
              {[
                { name: 'Home', route: '/' },
                { name: 'Court Services', route: '/services' },
                { name: 'Forms', route: '/forms' },
                { name: 'Legal Resources', route: '/legal-resources' },
                { name: 'Information', route: '/contact' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.route)}
                  className="text-slate-700 hover:text-amber-500 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 md:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight tracking-tight">
            Welcome to the San Mateo County Court Self-Help Center
          </h1>
          <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Access legal resources, court forms, and guidance to navigate the legal system. Our self-help services are designed to assist you with your legal proceedings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/legal-resources')}
              className="group bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Begin Self-Help Process
            </button>
            <button
              onClick={() => navigate('/forms')}
              className="group bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 border border-white/30 backdrop-blur-sm flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <FileText className="w-5 h-5" />
              Access Court Forms
            </button>
          </div>
        </div>
        {/* Decorative gradient circle */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-400/10 rounded-full blur-2xl z-0" />
      </section>

      {/* Main Content */}
      <main className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          {/* Emergency Banner */}
          <div className="bg-amber-100 text-amber-900 p-5 rounded-xl mb-14 text-center border-l-4 border-amber-400 flex flex-col md:flex-row items-center justify-center gap-3 shadow">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <span className="font-semibold text-lg">Emergency Assistance Required?</span>
            <span className="text-base">If you are experiencing domestic violence or require immediate legal protection, <strong>call 911</strong> or contact emergency services immediately.</span>
          </div>

          {/* Services Section */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-slate-900">
              How May We Assist You Today?
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
              Select from our comprehensive self-help services designed to guide you through legal processes
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    ref={el => serviceCardsRef.current[index] = el}
                    className="bg-white p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-amber-400 cursor-pointer group flex flex-col items-center text-center"
                    onClick={() => navigate(service.route)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-5 shadow group-hover:scale-105 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-amber-600 transition-colors">{service.title}</h3>
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm">{service.description}</p>
                    <span className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:underline">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Links Section */}
          <section className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-slate-900">
              Frequently Requested Services
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
              Quick access to commonly needed legal resources and information
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.title}
                    onClick={() => navigate(link.route)}
                    className="group bg-slate-100 hover:bg-amber-50 p-6 rounded-2xl text-left text-slate-900 transition-all duration-300 border border-slate-200 hover:border-amber-400 flex gap-4 items-center shadow-sm hover:shadow-md"
                  >
                    <span className={`w-14 h-14 ${link.color} rounded-full flex items-center justify-center text-white text-2xl shadow group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-lg font-semibold mb-1 group-hover:text-amber-600 transition-colors">{link.title}</span>
                      <span className="block text-slate-600 text-sm">{link.description}</span>
                    </span>
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 border-t-2 border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <p className="text-xl font-semibold mb-2 text-amber-400">
              Superior Court of California
            </p>
            <p className="text-lg text-slate-300 mb-4">
              County of San Mateo
            </p>
            <p className="text-slate-400">
              Committed to providing accessible justice and comprehensive legal support for all community members
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-slate-800">
            {[
              { name: 'Contact Information', route: '/contact' },
              { name: 'Hours & Locations', route: '/contact' },
              { name: 'Accessibility Services', route: '/learn' },
              { name: 'Privacy Policy', route: '/services' },
              { name: 'Site Directory', route: '/' }
            ].map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.route)}
                className="text-slate-400 hover:text-amber-400 transition-colors duration-300 font-medium"
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

export default CourtKiosk; 