import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building,
  Home,
  Heart,
  Scale,
  Gavel,
  Car,
  Users,
  Baby,
  DollarSign,
  Shield,
  AlertTriangle,
  CreditCard,
  FileText,
  FileSearch,
  Users2,
  Clock,
  Grid,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  GraduationCap,
  FileCheck,
  Globe,
  HelpCircle,
} from 'lucide-react';

const CourtServices = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('family');

  const serviceCategories = [
    {
      id: 'family',
      title: 'Family Court',
      icon: Heart,
      color: 'from-slate-700 to-slate-800',
      emoji: '👨‍👩‍👧‍👦',
      description: 'Family law matters including divorce, custody, and support.',
      services: [
        {
          name: 'Divorce & Legal Separation',
          icon: Users,
          description: 'File for divorce or legal separation, manage property division and support arrangements.',
          features: ['Online filing available', 'Self-help resources', 'Mediation services', 'Fee waiver options'],
          requirements: ['Residency requirements met', 'All forms completed', 'Filing fees paid or waived'],
          estimatedTime: '6-12 months',
          cost: '$435 filing fee',
          status: 'Available 24/7'
        },
        {
          name: 'Child Custody & Visitation',
          icon: Baby,
          description: 'Establish or modify custody arrangements and visitation schedules.',
          features: ['Parenting plan creation', 'Mediation required', 'Best interests evaluation', 'Court supervision'],
          requirements: ["Child's best interests", 'Parenting plan', 'Mediation completion', 'Court approval'],
          estimatedTime: '3-6 months',
          cost: '$435 filing fee',
          status: 'Available 24/7'
        },
        {
          name: 'Child Support & Spousal Support',
          icon: DollarSign,
          description: 'Calculate, establish, or modify support payments.',
          features: ['Support calculator', 'Income verification', 'Modification process', 'Enforcement options'],
          requirements: ['Income documentation', 'Child support guidelines', 'Court order', 'Regular review'],
          estimatedTime: '2-4 months',
          cost: '$435 filing fee',
          status: 'Available 24/7'
        },
        {
          name: 'Domestic Violence Protection',
          icon: Shield,
          description: 'File for restraining orders and access safety resources.',
          features: ['Emergency protection', 'Safety planning', 'Legal advocacy', 'Support services'],
          requirements: ['Immediate danger', 'Evidence of abuse', 'Court hearing', 'Service to respondent'],
          estimatedTime: 'Same day (TRO)',
          cost: 'No filing fee',
          status: 'Emergency service'
        }
      ]
    },
    {
      id: 'civil',
      title: 'Civil Court',
      icon: Scale,
      color: 'from-blue-600 to-blue-700',
      emoji: '⚖️',
      description: 'Civil disputes, small claims, and general civil matters.',
      services: [
        {
          name: 'Small Claims Court',
          icon: DollarSign,
          description: 'Resolve disputes involving amounts up to $10,000.',
          features: ['Simplified process', 'No attorneys required', 'Quick resolution', 'Informal hearings'],
          requirements: ['Claim under $10,000', 'Proper jurisdiction', 'Service of process', 'Evidence preparation'],
          estimatedTime: '30-90 days',
          cost: '$30 filing fee',
          status: 'Available 24/7'
        },
        {
          name: 'General Civil Cases',
          icon: FileText,
          description: 'Handle larger civil disputes and complex legal matters.',
          features: ['Attorney representation', 'Discovery process', 'Jury trials', 'Appeals process'],
          requirements: ['Legal representation', 'Proper pleadings', 'Discovery compliance', 'Court deadlines'],
          estimatedTime: '1-3 years',
          cost: '$435 filing fee',
          status: 'Business hours'
        },
        {
          name: 'Landlord-Tenant Disputes',
          icon: Building,
          description: 'Resolve rental disputes and eviction proceedings.',
          features: ['Eviction process', 'Rent disputes', 'Habitability issues', 'Security deposit claims'],
          requirements: ['Proper notice', 'Court filing', 'Service of process', 'Hearing attendance'],
          estimatedTime: '30-60 days',
          cost: '$435 filing fee',
          status: 'Available 24/7'
        }
      ]
    },
    {
      id: 'criminal',
      title: 'Criminal Court',
      icon: Gavel,
      color: 'from-red-600 to-red-700',
      emoji: '🔨',
      description: 'Criminal cases, traffic violations, and infractions.',
      services: [
        {
          name: 'Traffic Violations',
          icon: Car,
          description: 'Handle traffic tickets and moving violations.',
          features: ['Online payment', 'Traffic school', 'Contest tickets', 'License reinstatement'],
          requirements: ['Ticket information', 'Payment or contest', 'Court appearance', 'License compliance'],
          estimatedTime: '30-90 days',
          cost: 'Varies by violation',
          status: 'Available 24/7'
        },
        {
          name: 'Misdemeanor Cases',
          icon: AlertTriangle,
          description: 'Handle misdemeanor criminal charges.',
          features: ['Public defender', 'Plea options', 'Sentencing', 'Probation'],
          requirements: ['Legal representation', 'Court appearance', 'Plea entry', 'Sentence compliance'],
          estimatedTime: '3-12 months',
          cost: 'Court costs vary',
          status: 'Business hours'
        },
        {
          name: 'Felony Cases',
          icon: Shield,
          description: 'Handle serious criminal charges.',
          features: ['Public defender', 'Preliminary hearing', 'Jury trial', 'Sentencing'],
          requirements: ['Legal representation', 'Court appearances', 'Trial preparation', 'Sentence compliance'],
          estimatedTime: '1-3 years',
          cost: 'Court costs vary',
          status: 'Business hours'
        }
      ]
    },
    {
      id: 'traffic',
      title: 'Traffic Court',
      icon: Car,
      color: 'from-amber-600 to-amber-700',
      emoji: '🚗',
      description: 'Traffic violations, parking tickets, and vehicle-related matters.',
      services: [
        {
          name: 'Traffic Ticket Payment',
          icon: CreditCard,
          description: 'Pay traffic tickets and fines online or in person.',
          features: ['Online payment', 'Payment plans', 'Receipts', 'License clearance'],
          requirements: ['Ticket number', 'Payment method', 'Court jurisdiction', 'Timely payment'],
          estimatedTime: 'Immediate',
          cost: 'Ticket amount',
          status: 'Available 24/7'
        },
        {
          name: 'Traffic School',
          icon: GraduationCap,
          description: 'Complete traffic school to reduce points on your license.',
          features: ['Online courses', 'Point reduction', 'Insurance benefits', 'Certificate'],
          requirements: ['Eligible violation', 'Course completion', 'Certificate submission', 'Court approval'],
          estimatedTime: '4-8 hours',
          cost: '$25 course fee',
          status: 'Available 24/7'
        },
        {
          name: 'Contest Traffic Ticket',
          icon: FileCheck,
          description: 'Contest traffic violations and request hearings.',
          features: ['Written declaration', 'Court hearing', 'Evidence submission', 'Appeal process'],
          requirements: ['Timely contest', 'Evidence preparation', 'Court appearance', 'Legal grounds'],
          estimatedTime: '30-90 days',
          cost: 'Bail amount',
          status: 'Business hours'
        }
      ]
    }
  ];

  const quickServices = [
    {
      name: 'Case Filing',
      icon: FileText,
      description: 'File new cases and submit documents electronically.',
      color: 'from-blue-600 to-blue-700',
      route: '/forms'
    },
    {
      name: 'Payment Services',
      icon: CreditCard,
      description: 'Pay court fees, fines, and other charges online.',
      color: 'from-green-600 to-green-700',
      route: '/contact'
    },
    {
      name: 'Court Records',
      icon: FileSearch,
      description: 'Search and access court records and case information.',
      color: 'from-purple-600 to-purple-700',
      route: '/contact'
    },
    {
      name: 'Mediation Services',
      icon: Users2,
      description: 'Alternative dispute resolution and mediation programs.',
      color: 'from-indigo-600 to-indigo-700',
      route: '/contact'
    },
    {
      name: 'Interpreter Services',
      icon: Globe,
      description: 'Request certified interpreters for court proceedings.',
      color: 'from-teal-600 to-teal-700',
      route: '/contact'
    },
    {
      name: 'Self-Help Resources',
      icon: HelpCircle,
      description: 'Access guides, tutorials, and legal assistance.',
      color: 'from-amber-600 to-amber-700',
      route: '/learn'
    }
  ];

  const courtStats = [
    { number: '500k+', label: 'Cases Processed Annually', icon: FileText },
    { number: '24/7', label: 'Online Services Available', icon: Clock },
    { number: '15+', label: 'Service Categories', icon: Grid },
    { number: '95%', label: 'Customer Satisfaction', icon: Star },
  ];

  const getIcon = (iconName) => {
    const icons = {
      Users,
      Baby,
      DollarSign,
      Shield,
      Scale,
      Car,
      Gavel,
      CreditCard,
      FileText,
      FileSearch,
      Users2,
      Globe,
      HelpCircle,
      Clock,
      Grid,
      Star,
      Heart,
      Building,
      AlertTriangle,
      GraduationCap,
      FileCheck,
      Phone,
      Mail,
      MapPin,
      CheckCircle
    };
    return icons[iconName] || FileText;
  };

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
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              <Building className="h-12 w-12 text-amber-400" />
            </div>
            <h1 className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-5xl font-extrabold text-transparent">
              Court Services
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-slate-700">
              Access comprehensive court services designed to help you navigate legal proceedings with confidence and clarity.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {courtStats.map((stat, index) => {
            const Icon = getIcon(stat.icon);
            return (
              <div key={index} className="transform rounded-2xl border border-stone-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900">
                    <Icon className="h-7 w-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Services Grid */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-slate-900">Featured Services</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Get quick access to our most popular court services and resources.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {quickServices.map((service) => {
              const Icon = getIcon(service.icon);
              return (
                <button
                  key={service.name}
                  onClick={() => navigate(service.route)}
                  className="group transform rounded-2xl border-2 border-transparent bg-white p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110 ${service.color}`}>
                      <Icon className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-slate-700">{service.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Access Service</span>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-slate-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Categories Tabs */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
          <div className="border-b border-stone-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <nav className="flex space-x-2 overflow-x-auto p-6" aria-label="Tabs">
              {serviceCategories.map((category) => {
                const Icon = getIcon(category.icon);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`flex-shrink-0 flex items-center gap-3 rounded-xl px-8 py-4 text-sm font-semibold transition-all duration-300 ${
                      activeTab === category.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {category.title}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-12">
            {serviceCategories.map((category) => (
              <div key={category.id} className={activeTab === category.id ? 'block' : 'hidden'}>
                <div className="mb-10 flex items-center gap-6">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${category.color}`}>
                    {category.emoji}
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-slate-900">{category.title} Services</h3>
                    <p className="mt-2 text-lg text-slate-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                  {category.services.map((service, index) => {
                    const Icon = getIcon(service.icon);
                    return (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
                        <div className="mb-6 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800">
                            <Icon className="h-7 w-7 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-slate-900">{service.name}</h4>
                            <p className="mt-2 text-slate-600">{service.description}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h5 className="mb-3 text-lg font-semibold text-slate-900">Features:</h5>
                            <ul className="space-y-2">
                              {service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-slate-600">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
                            <div>
                              <span className="text-lg font-semibold text-slate-900">Requirements:</span>
                              <ul className="mt-3 space-y-2">
                                {service.requirements.map((req, idx) => (
                                  <li key={idx} className="text-slate-600">
                                    <span className="mr-2 text-amber-600">•</span>
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <span className="text-lg font-semibold text-slate-900">Timeline:</span>
                                <p className="mt-1 text-slate-600">{service.estimatedTime}</p>
                              </div>
                              <div>
                                <span className="text-lg font-semibold text-slate-900">Cost:</span>
                                <p className="mt-1 text-slate-600">{service.cost}</p>
                              </div>
                              <div>
                                <span className="text-lg font-semibold text-slate-900">Availability:</span>
                                <p className="mt-1 text-slate-600">{service.status}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-16 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-white shadow-2xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-5xl font-bold">Need Help?</h2>
            <p className="text-xl text-slate-300">Contact our court services team for assistance.</p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500">
                <Phone className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Phone Support</h3>
              <p className="mb-2 text-slate-300">Available during business hours</p>
              <p className="text-xl font-semibold text-amber-400">(650) 678-2222</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500">
                <Mail className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Email Support</h3>
              <p className="mb-2 text-slate-300">Send us your questions</p>
              <p className="text-xl font-semibold text-amber-400">courtinfo@sanmateocourt.org</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500">
                <MapPin className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">In-Person Support</h3>
              <p className="mb-2 text-slate-300">In-person assistance available</p>
              <p className="text-xl font-semibold text-amber-400">400 County Center, Redwood City</p>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <AlertTriangle className="h-10 w-10" />
              <div>
                <h3 className="text-2xl font-bold text-white">Emergency Assistance Required?</h3>
                <p className="mt-2 text-red-100">If you are experiencing domestic violence or require immediate legal protection.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">Call 911</p>
              <p className="mt-1 text-red-100">or contact emergency services immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtServices; 