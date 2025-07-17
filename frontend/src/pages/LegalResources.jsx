import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  Shield,
  Home,
  ArrowRight,
  Search,
  Clock,
  Phone,
  Mail,
  MapPin,
  Scale,
  Gavel,
  Heart,
  Car,
  Building,
  HelpCircle,
  Globe,
  Target,
  MessageSquare
} from 'lucide-react';

const LegalResources = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const legalTopics = [
    {
      id: 'family-law',
      title: 'Family Law',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      emoji: '👨‍👩‍👧‍👦',
      description: 'Divorce, custody, support, and family matters',
      resources: [
        {
          title: 'Divorce Process Guide',
          description: 'Step-by-step guide to filing for divorce in California',
          type: 'Guide',
          duration: '15 min read',
          difficulty: 'Beginner',
          icon: FileText,
          route: '/learn'
        },
        {
          title: 'Child Custody Laws',
          description: 'Understanding custody arrangements and visitation rights',
          type: 'Legal Reference',
          duration: '10 min read',
          difficulty: 'Intermediate',
          icon: BookOpen,
          route: '/learn'
        },
        {
          title: 'Child Support Calculator',
          description: 'Calculate child support payments based on California guidelines',
          type: 'Tool',
          duration: '5 min',
          difficulty: 'Beginner',
          icon: FileText,
          route: '/learn'
        },
        {
          title: 'Domestic Violence Resources',
          description: 'Emergency protection and safety planning resources',
          type: 'Emergency',
          duration: 'Immediate',
          difficulty: 'All Levels',
          icon: Shield,
          route: '/learn'
        }
      ]
    }
  ];

  const quickAccess = [
    {
      title: 'Family Law Resources',
      description: 'Divorce, custody, support, and family matters',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      route: '/qna/divorce'
    },
    {
      title: 'Court Forms',
      description: 'Access official court forms with instructions',
      icon: FileText,
      color: 'from-slate-500 to-slate-600',
      route: '/forms'
    }
  ];

  const legalOrganizations = [
    {
      name: 'Legal Aid Society of San Mateo County',
      description: 'Free legal services for low-income residents',
      phone: '(650) 558-0915',
      website: 'https://legalaidsmc.org',
      services: ['Family Law', 'Divorce', 'Child Custody']
    },
    {
      name: 'California Courts Self-Help',
      description: 'Official self-help resources from California courts',
      phone: '(800) 900-5980',
      website: 'https://www.courts.ca.gov/selfhelp.htm',
      services: ['Family Law', 'Divorce', 'Forms & Guides']
    },
    {
      name: 'LawHelp California',
      description: 'Free legal information and resources',
      phone: 'N/A',
      website: 'https://lawhelpca.org',
      services: ['Family Law', 'Legal Information', 'Resources']
    },
    {
      name: 'San Mateo County Bar Association',
      description: 'Professional association with lawyer referral service',
      phone: '(650) 298-4030',
      website: 'https://smcba.org',
      services: ['Family Law', 'Divorce', 'Child Support']
    }
  ];

  const getIcon = (iconName) => {
    const icons = {
      BookOpen, FileText, Users, Shield, Home, ArrowRight, Search, Clock, Phone, Mail, MapPin, Scale, Gavel, Heart, Car, Building, HelpCircle, Globe, Target, MessageSquare
    };
    return icons[iconName] || FileText;
  };

  const filteredTopics = legalTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.resources.some(resource => 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-slate-100">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-12 rounded-3xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-12 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="group flex transform items-center rounded-2xl bg-white px-6 py-3 text-lg font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:text-slate-900 hover:shadow-xl"
            >
              <Home className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Back to Home
            </button>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900">
              <BookOpen className="h-12 w-12 text-amber-40" />
            </div>
            <h1 className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-5xl font-extrabold text-transparent">
              Legal Resources & Information
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-700">
              Comprehensive legal information, guides, and resources to help you understand your rights and navigate the legal system.
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-16">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Quick Access</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Get started with these essential tools and resources
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {quickAccess.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <button
                  key={item.title}
                  onClick={() => navigate(item.route)}
                  className="group transform rounded-2xl border-2 border-transparent bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110 ${item.color}`}>
                      <Icon className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-slate-700">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Access Resource</span>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search legal resources, topics, or guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-lg shadow-lg focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Legal Topics */}
        <div className="mb-16">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900">Legal Topics</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Explore comprehensive resources organized by legal area
            </p>
          </div>

          <div className="space-y-12">
            {filteredTopics.map((topic) => {
              const Icon = getIcon(topic.icon);
              return (
                <div key={topic.id} className="rounded-3xl border border-stone-200 bg-white p-12 shadow-2xl">
                  <div className="mb-8 flex items-center gap-6">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${topic.color}`}>
                      {topic.emoji}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900">{topic.title}</h3>
                      <p className="mt-2 text-lg text-slate-600">{topic.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {topic.resources.map((resource, index) => {
                      const ResourceIcon = getIcon(resource.icon);
                      return (
                        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <div className="mb-4 flex items-center gap-3">
                            <ResourceIcon className="h-6 w-6 text-slate-600" />
                            <span className="text-sm font-semibold text-slate-500">{resource.type}</span>
                          </div>
                          <h4 className="mb-2 text-lg font-bold text-slate-900">{resource.title}</h4>
                          <p className="mb-4 text-slate-600">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {resource.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {resource.difficulty}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(resource.route)}
                              className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition-colors hover:bg-amber-100 hover:text-amber-700"
                            >
                              Access
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal Organizations */}
        <div className="mb-16 rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-12 shadow-2xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">Legal Organizations</h2>
            <p className="text-xl text-slate-300 text-white">with organizations that provide legal assistance and support</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {legalOrganizations.map((org, index) => (
              <div key={index} className="rounded-2xl border border-slate-700 p-8 text-white">
                <h3 className="mb-3 text-2xl font-bold text-amber-400">{org.name}</h3>
                <p className="mb-4 text-slate-300">{org.description}</p>
                <div className="mb-4 space-y-2">
                  {org.phone !== 'N/A' && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="h-4 w-4" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="h-4 w-4" />
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                      {org.website}
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {org.services.map((service, idx) => (
                    <span key={idx} className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 p-12 shadow-2xl">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">Need More Help?</h2>
            <p className="mb-8 text-xl text-amber-100 text-white">
              If you can't find what you're looking for, our team is here to help
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-amber-600 transition-all duration-300 hover:bg-amber-50 hover:shadow-lg"
              >
                Contact Court Services
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="rounded-2xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-amber-600"
              >
                Browse FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalResources;
 