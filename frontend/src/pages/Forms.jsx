import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Users,
  Shield,
  DollarSign,
  Baby,
  UserCheck,
  Clock,
  Info,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  Copy,
  Upload,
  Send,
  MapPin
} from 'lucide-react';

const Forms = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formCategories = [
    {
      id: 'divorce',
      title: 'Divorce / Legal Separation',
      icon: Users,
      color: 'from-slate-700 to-slate-800',
      emoji: '💔',
      description: 'Dissolution of marriage or legal separation proceedings, forms:',
      forms: [
        {
          name: 'Petition for Dissolution of Marriage (or Legal Separation)',
          required: true,
          description: 'Initial petition to start divorce proceedings',
          formNumber: 'FL-100'
        },
        {
          name: 'Summons',
          required: true,
          description: 'Legal notice to your spouse about the divorce filing',
          formNumber: 'FL-110'
        },
        {
          name: 'Proof of Service',
          required: true,
          description: 'Documentation that the other party was served',
          formNumber: 'FL-115'
        },
        {
          name: 'Declaration Under UCCJEA',
          required: false,
          description: 'Required when children are involved',
          formNumber: 'FL-105'
        },
        {
          name: 'Income and Expense Declaration',
          required: true,
          description: 'Financial information for support calculations',
          formNumber: 'FL-150'
        },
        {
          name: 'Schedule of Assets and Debts',
          required: true,
          description: 'Complete list of marital property and debts',
          formNumber: 'FL-142'
        },
        {
          name: 'Request for Order (RFO)',
          required: false,
          description: 'For temporary orders (custody, support, etc.)',
          formNumber: 'FL-300'
        },
        {
          name: 'Final Judgment / Settlement Agreement',
          required: true,
          description: 'Final court order ending the marriage',
          formNumber: 'FL-180'
        }
      ]
    },
    {
      id: 'custody',
      title: 'Child Custody / Visitation',
      icon: Baby,
      color: 'from-amber-600 to-amber-700',
      emoji: '👨‍👩‍👧‍👦',
      description: 'Custody arrangements and visitation schedules, forms:',
      forms: [
        {
          name: 'Petition for Custody and Support of Minor Children',
          required: true,
          description: 'Main custody petition (if not part of divorce)',
          formNumber: 'FL-200'
        },
        {
          name: 'Declaration Under UCCJEA',
          required: true,
          description: 'Required for custody cases',
          formNumber: 'FL-105'
        },
        {
          name: 'Request for Order (RFO)',
          required: true,
          description: 'Request for custody/visitation orders',
          formNumber: 'FL-300'
        },
        {
          name: 'Proof of Service by Mail / Personal Service',
          required: true,
          description: 'Documentation of service to other parent',
          formNumber: 'FL-115'
        },
        {
          name: 'Parenting Plan / Custody Agreement',
          required: false,
          description: 'Agreed-upon custody arrangement',
          formNumber: 'FL-341'
        },
        {
          name: 'Mediation Paperwork',
          required: false,
          description: 'Required by some courts before hearings',
          formNumber: 'Varies'
        }
      ]
    },
    {
      id: 'support',
      title: 'Child Support / Spousal Support',
      icon: DollarSign,
      color: 'from-emerald-600 to-emerald-700',
      emoji: '💰',
      description: 'Financial support for children and/or former spouse, forms:',
      forms: [
        {
          name: 'Request for Order (RFO)',
          required: true,
          description: 'Request for support order',
          formNumber: 'FL-300'
        },
        {
          name: 'Income and Expense Declaration',
          required: true,
          description: 'Detailed financial information',
          formNumber: 'FL-150'
        },
        {
          name: 'Proof of Income',
          required: true,
          description: 'Pay stubs, tax returns, etc.',
          formNumber: 'N/A'
        },
        {
          name: 'Child Support Calculation Worksheet',
          required: false,
          description: 'Optional calculation tool',
          formNumber: 'FL-150'
        },
        {
          name: 'Proof of Service',
          required: true,
          description: 'Documentation of service',
          formNumber: 'FL-115'
        }
      ]
    },
    {
      id: 'domestic-violence',
      title: 'Domestic Violence Restraining Order',
      icon: Shield,
      color: 'from-red-700 to-red-800',
      emoji: '🛡️',
      description: 'Protection orders for domestic violence situations, forms:',
      forms: [
        {
          name: 'Request for Domestic Violence Restraining Order',
          required: true,
          description: 'Main restraining order form',
          formNumber: 'DV-100'
        },
        {
          name: 'Temporary Restraining Order (TRO)',
          required: true,
          description: 'Emergency protection',
          formNumber: 'DV-110'
        },
        {
          name: 'Notice of Court Hearing',
          required: true,
          description: 'Hearing notice',
          formNumber: 'DV-109'
        },
        {
          name: 'Proof of Service of DVRO',
          required: true,
          description: 'Documentation of service',
          formNumber: 'DV-200'
        },
        {
          name: 'DV-100, DV-110, 109 forms',
          required: true,
          description: 'California specific forms',
          formNumber: 'DV Series'
        }
      ]
    },
    {
      id: 'parentage',
      title: 'Parentage (Paternity)',
      icon: UserCheck,
      color: 'from-indigo-600 to-indigo-700',
      emoji: '👶',
      description: 'Establishing legal parentage and paternity, forms:',
      forms: [
        {
          name: 'Petition to Establish Parental Relationship',
          required: true,
          description: 'Main parentage petition',
          formNumber: 'FL-200'
        },
        {
          name: 'Summons',
          required: true,
          description: 'Legal notice to other parent',
          formNumber: 'FL-110'
        },
        {
          name: 'Declaration Under UCCJEA',
          required: true,
          description: 'Required for custody cases',
          formNumber: 'FL-105'
        },
        {
          name: 'Proof of Service',
          required: true,
          description: 'Documentation of service',
          formNumber: 'FL-115'
        },
        {
          name: 'Request for Genetic Testing',
          required: false,
          description: 'If paternity is disputed',
          formNumber: 'FL-600'
        },
        {
          name: 'Stipulated Judgment',
          required: false,
          description: 'If both parties agree',
          formNumber: 'FL-180'
        }
      ]
    },
    {
      id: 'guardianship',
      title: 'Guardianship',
      icon: Users,
      color: 'from-slate-600 to-slate-700',
      emoji: '👨‍⚖️',
      description: 'Legal guardianship of minor children, forms:',
      forms: [
        {
          name: 'Petition for Appointment of Guardian of Minor',
          required: true,
          description: 'Main guardianship petition',
          formNumber: 'GC-210'
        },
        {
          name: 'Consent of Proposed Guardian',
          required: true,
          description: 'Guardian consent form',
          formNumber: 'GC-211'
        },
        {
          name: 'Notice of Hearing',
          required: true,
          description: 'Hearing notice',
          formNumber: 'GC-020'
        },
        {
          name: 'Proof of Service',
          required: true,
          description: 'Documentation of service',
          formNumber: 'GC-020'
        },
        {
          name: 'Investigation Reports',
          required: true,
          description: 'Background investigation',
          formNumber: 'GC-250'
        },
        {
          name: 'Guardianship Order',
          required: true,
          description: 'Final guardianship order',
          formNumber: 'GC-340'
        }
      ]
    }
  ];

  const filingSteps = 
    [
      { step: 1, title: 'Find the correct forms', description: 'Visit your state\'s court website and search for forms by case type.', icon: Search },
      { step: 2, title: 'Fill out the forms completely', description: 'Use readable handwriting or complete them online. Some courts offer guided form completion.', icon: FileText },
      { step: 3, title: 'Make copies', description: 'Make at least 2 copies: 1 for you, 1 for the other party, 1 for the court (original).', icon: Copy },
      { step: 4, title: 'File the forms with the court', description: 'Take forms to the family law clerk\'s office or file online. Pay filing fee or request fee waiver.', icon: Upload },
      { step: 5, title: 'Serve the other party', description: 'Use personal service for initial filings. Complete and file a Proof of Service.', icon: Send },
      { step: 6, title: 'Attend hearings', description: 'Show up on the date listed in the hearing notice. Bring all supporting documentation.', icon: Clock }
    ];

  const helpfulResources = 
    [
      { name: 'LawHelp.org', description: 'Free legal information by state', url: 'https://lawhelp.org' },
      { name: 'California Courts Forms', description: 'Official California court forms', url: 'https://www.courts.ca.gov/forms.htm' },
      { name: 'Legal Aid Office Locator', description: 'Find free legal assistance', url: 'https://www.lsc.gov/find-legal-aid' },
      { name: 'Self-Help Centers', description: 'In-person assistance at courthouses', url: 'https://www.courts.ca.gov/selfhelp-centers.htm' }
    ];

  const filteredCategories = formCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName) => {
    const icons = {
      Users,
      Baby,
      DollarSign,
      Shield,
      UserCheck,
      Clock,
      Info,
      Search,
      Filter,
      BookOpen,
      HelpCircle,
      MapPin
    };
    return icons[iconName] || FileText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50to-slate-100">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-stone-50 rounded-3xl shadow-2xl p-10 mb-10 border border-stone-200">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}         className="group flex items-center text-slate-700 hover:text-slate-900 transition-all duration-300 text-lg font-semibold bg-white px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />              Back to Home
            </button>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FileText className="w-12 h-12 text-amber-400" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900">
              Court Forms & Documents
            </h1>
            <p className="text-slate-700 text-xl leading-relaxed max-w-3xl mx-auto">
              Find the right forms for your family court case. Each case type has specific required documents and filing procedures.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-stone-200">
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search for case types or forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-lg border-none outline-none bg-transparent"
            />
            <Filter className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Residency Requirements */}
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl shadow-xl p-8 mb-10 border border-slate-300">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-slate-700" /> Residency Requirements (San Mateo County)
          </h2>
          <ul className="list-disc pl-8 text-lg text-slate-900 space-y-2">
            <li>At least one spouse must have lived in California for <b>6 months</b>.</li>
            <li>At least one spouse must have lived in <b>San Mateo County for 3 months</b>.</li>
            <li>File in the county where you currently live.</li>
          </ul>
          <div className="mt-4 text-slate-700 text-sm">
            <a href="https://www.smcgov.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">San Mateo County Government</a> &nbsp;|&nbsp;
            <a href="https://www.smclawlibrary.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">San Mateo Law Library</a>
          </div>
        </div>

        {/* Case Type Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredCategories.map((category) => {
            const Icon = getIconComponent(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-slate-300 transform hover:-translate-y-2 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-2xl`}>
                    {category.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 text-sm">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {category.forms.length} forms
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <div className="bg-white rounded-3xl shadow-2xl p-16 border border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${selectedCategory.color} rounded-2xl flex items-center justify-center text-2xl`}>
                  {selectedCategory.emoji}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{selectedCategory.title}</h2>
                  <p className="text-slate-600">{selectedCategory.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Forms List */}
            <div className="space-y-4">
              {selectedCategory.forms.map((form, index) => (
                <div key={index} className="border border-stone-200 rounded-2xl p-6 shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {form.formNumber}
                        </span>
                        {form.required && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{form.name}</h3>
                      <p className="text-slate-600">{form.description}</p>
                    </div>
                    <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors ml-4 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filing Process Steps */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-16 mb-16 text-white overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 bg-slate-300 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -60 h-60 bg-slate-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <FileText className="w-10 h-10" />
              </div>
              <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
                Filing Process
              </h2>
              <p className="text-slate-200 text-xl max-w-2xl mx-auto leading-relaxed">
                Follow these steps to properly file your court documents and ensure your case proceeds smoothly
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.step} 
                    className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {step.step}
                        </div>
                        <div className="absolute -top-1 right-1 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                          <Icon className="w-3 h-3 text-slate-800" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 hover:text-amber-200 transition-colors">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-200 text-base leading-relaxed group-hover:text-white transition-colors">
                      {step.description}
                    </p>
                    
                    {/* Progress indicator */}
                    <div className="mt-6 flex items-center gap-2">
                      <div className="flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                          style={{ width: `${((index + 1) / filingSteps.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-300">Step {step.step} of {filingSteps.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Call to action */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
                <Clock className="w-5 h-5 text-amber-300" />
                <span className="text-slate-200">
                  Need help? Visit our Self-Help Center or contact the court clerk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Resources */}
        <div className="bg-white rounded-3xl shadow-2xl p-16 border border-stone-200">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-6 shadow-lg">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Helpful Resources</h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">Additional tools and resources for your case</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {helpfulResources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-stone-50 rounded-2xl hover:bg-slate-50 transition-all duration-300 border-transparent hover:border-slate-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                      {resource.name}
                    </h3>
                    <p className="text-slate-600">{resource.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Practical Advice Section */}
        <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl shadow-2xl p-12 mb-10 border border-amber-200 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -60 h-60 bg-amber-200 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Practical Advice for Family Court</h2>
              <p className="text-amber-80 text-xl max-w-3xl mx-auto">Essential tips to help you navigate the family court process successfully</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Be Prepared, Not Just Present
                  </h3>
                  <p className="text-amber-800">Know what you're asking for, bring all evidence, and organize your documents.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    Fill Out Forms Accurately
                  </h3>
                  <p className="text-amber-800">Don't leave blanks, be honest, and use attachments for long responses.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Send className="w-5 h-5 text-indigo-600" />
                    Serve the Other Party Correctly
                  </h3>
                  <p className="text-amber-800">Someone 18+ (not you) must serve documents. File Proof of Service promptly.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-600" />
                    Show Up Early and Dressed Appropriately
                  </h3>
                  <p className="text-amber-800">Arrive 30 minutes early, dress business casual, and leave kids at home unless instructed.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Be Respectful to Everyone
                  </h3>
                  <p className="text-amber-800">Address the judge as "Your Honor," stay calm, and never interrupt.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Know the Judge's Role
                  </h3>
                  <p className="text-amber-800">Stick to facts and evidence, not emotions.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Use the San Mateo Self-Help Center
                  </h3>
                  <p className="text-amber-800">Free help with forms, workshops, and legal info at the Redwood City courthouse.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <Copy className="w-5 h-5 text-slate-600" />
                    Keep Records of Communication
                  </h3>
                  <p className="text-amber-800">Save emails, texts, and use co-parenting apps if needed.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Deadlines Are Serious
                  </h3>
                  <p className="text-amber-800">Missing deadlines can lead to default judgments or delays. Use reminders.</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-20 hover:bg-white/80 transition-all duration-300">
                  <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    Manage Emotions Strategically
                  </h3>
                  <p className="text-amber-800">Stay calm, practice your summary, and ask for breaks if needed.</p>
                </div>
              </div>
            </div>
            
            {/* Bonus Tips */}
            <div className="mt-8 bg-slate-900 rounded-2xl text-white shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Info className="w-6 h-6 text-amber-400" />
                <span className="text-amber-300">Bonus Tips</span>
              </h3>
              <p className="text-white">If you don't understand a question, ask for clarification. If you can't attend a hearing, file a Request to Continue (FL-36 in CA). For fee waivers, use FW-001 and FW-3.</p>
            </div>
          </div>
        </div>

        {/* Key San Mateo County Court Info */}
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl shadow-xl p-8 mt-16 border border-slate-300">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-slate-700" /> Key San Mateo County Court Info
          </h2>
          <ul className="list-disc pl-8 text-lg text-slate-900 space-y-2">
            <li><b>Main Family Court Location:</b> Hall of Justice – 400County Center, Redwood City, CA</li>
            <li><b>Clerks Office Hours:</b> Check the <a href="https://www.sanmateocourt.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">San Mateo Superior Court website</a></li>
            <li><b>Self-Help Center:</b> Free in-person help at the courthouse. <a href="https://www.sanmateocourt.org/self_help" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">Visit Website →</a></li>
            <li><b>Forms & Packets:</b> <a href="https://www.sanmateocourt.org/documents/forms_packets/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900">Family Law Form Packets</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Forms; 