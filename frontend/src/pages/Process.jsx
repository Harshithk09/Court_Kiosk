import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Users,
  Shield,
  DollarSign,
  Baby,
  UserCheck,
  Calendar,
  FileText,
  Info,
  HelpCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const Process = () => {
  const navigate = useNavigate();
  const [selectedProcess, setSelectedProcess] = useState(null);

  const courtProcesses =
  [
    {
      id: 'divorce-process',
      title: 'Divorce Process',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      emoji: '💔',
      description: 'Complete step-by-step guide to filing for divorce in San Mateo County',
      steps: [
        {
          step: 1,
          title: 'Check Residency Requirements',
          description: 'Ensure you meet the requirements: 6+ months in California, 3+ months in San Mateo County',
          details: [
            'At least one spouse must have lived in California for 6+ months',
            'At least one spouse must have lived in San Mateo County for 3+ months',
            'File in the county where you currently live'
          ],
          forms: ['Residency verification'],
          timeline: 'Before filing'
        },
        {
          step: 2,
          title: 'Prepare Initial Forms',
          description: 'Complete the required forms to start your divorce case',
          details: [
            'FL-100 Petition for Dissolution of Marriage',
            'FL-110: Summons',
            'FL-105:UCCJEA Declaration (if children involved)',
            'FL-150: Income and Expense Declaration',
            'FL-142: Schedule of Assets and Debts'
          ],
          forms: ['FL-100', 'FL-110', 'FL-105', 'FL-150', 'L-142'],
          timeline: '1 weeks'
        },
        {
          step: 3,
          title: 'File with Court Clerk',
          description: 'Submit your forms to the San Mateo County Superior Court',
          details: [
            'Make 3 copies of all forms (original + 2 copies)',
            'File at Redwood City courthouse or by mail',
            'Pay filing fee ($435), request fee waiver (FW-01), Court will stamp and return copies to you'
          ],
          forms: ['All initial forms', 'FW-1 (if requesting fee waiver)'],
          timeline: 'Same day'
        },
        {
          step: 4,
          title: 'Serve Your Spouse',
          description: 'Legally notify your spouse about the divorce filing',
          details: [
            'Have someone (18 not you) serve the papers',
            'Complete FL-115: Proof of Service, Spouse has 30 days to respond',
            'File proof of service with court within 30 days'
          ],
          forms: ['FL-115: Proof of Service'],
          timeline: 'Within 30 days of filing'
        },
        {
          step: 5,
          title: 'Exchange Financial Disclosures',
          description: 'Share financial information with your spouse',
          details: [
            'Complete FL-140tion of Disclosure',
            'Exchange within 60 days of filing or responding',
            'Include tax returns, pay stubs, bank statements',
            'File FL-141aration re Service of Declaration of Disclosure'
          ],
          forms: ['FL-140', 'L-141'],
          timeline: 'Within 60 days'
        },
        {
          step: 6,
          title: 'Request Temporary Orders (if needed)',
          description: 'Ask court for temporary custody, support, or other orders',
          details: [
            'File FL-300: Request for Order',
            'Include supporting declarations',
            'Attend hearing if scheduled',
            'Court will issue temporary orders'
          ],
          forms: ['FL-300: Request for Order'],
          timeline: 'As needed during process'
        },
        {
          step: 7,
          title: 'Finalize Divorce',
          description: 'Complete the divorce with final judgment',
          details: [
            'Wait mandatory 6 months from service date, If uncontested: File FL-165, FL-170, FL-180, FL-190, If contested: Attend trial or reach settlement',
            'Court issues final judgment'
          ],
          forms: ['FL-165', 'FL-170', 'FL-180', 'L-190'],
          timeline: '6+ months total'
        }
      ]
    },
    {
      id: 'custody-process',
      title: 'Child Custody Process',
      icon: Baby,
      color: 'from-green-50 to-green-600',
      emoji: '👨‍👩‍👧‍👦',
      description: 'How to establish or modify child custody arrangements',
      steps: [
        {
          step: 1,
          title: 'Determine Case Type',
          description: 'Decide if this is a new custody case or modification',
          details: [
            'New case: No existing custody order',
            'Modification: Changing existing order',
            'Emergency: Immediate safety concerns'
          ],
          forms: [],
          timeline: 'Before filing'
        },
        {
          step: 2,
          title: 'File Custody Petition',
          description: 'Submit the appropriate forms to start your case',
          details: [
            'FL-260 Petition for Custody and Support',
            'FL-210: Summons',
            'FL-105:UCCJEA Declaration',
            'FL-2: ADR Options Form'
          ],
          forms: ['FL-260', 'FL-210', 'FL-105', 'FL-2'],
          timeline: '1 weeks'
        },
        {
          step: 3,
          title: 'Serve Other Parent',
          description: 'Notify the other parent about the custody case',
          details: [
            'Personal service required for initial filing',
            'Complete Proof of Service',
            'Other parent has 30 days to respond'
          ],
          forms: ['Proof of Service'],
          timeline: 'Within 30 days'
        },
        {
          step: 4,
          title: 'Attend Mediation',
          description: 'Participate in court-ordered mediation',
          details: [
            'Family Court Services provides free mediation',
            'Mediator will help parents reach agreement, If agreement reached, submit to court for approval, If no agreement, case proceeds to hearing'
          ],
          forms: ['Mediation agreement (if reached)'],
          timeline: '2-4 weeks after filing'
        },
        {
          step: 5,
          title: 'Court Hearing',
          description: 'Present your case to the judge',
          details: [
            'Bring all relevant documents and evidence',
            'Be prepared to explain your position',
            'Judge will make custody decision',
            'Court will issue custody order'
          ],
          forms: ['All case documents'],
          timeline: '1ths total'
        }
      ]
    },
    {
      id: 'support-process',
      title: 'Child Support Process',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      emoji: '💰',
      description: 'How to establish or modify child support orders',
      steps: [
        {
          step: 1,
          title: 'Gather Financial Information',
          description: 'Collect all necessary financial documents',
          details: [
            'Recent pay stubs (last 3 months)',
            'Tax returns (last 2 years)',
            'Bank statements',
            'Other income documentation'
          ],
          forms: [],
          timeline: 'Before filing'
        },
        {
          step: 2,
          title: 'File Support Request',
          description: 'Submit forms to request child support',
          details: [
            'FL-300: Request for Order',
            'FL-150: Income and Expense Declaration',
            'Attach proof of income',
            'Include child support calculation worksheet'
          ],
          forms: ['FL-300', 'L-150'],
          timeline: '1 weeks'
        },
        {
          step: 3,
          title: 'Serve Other Parent',
          description: 'Notify the other parent about the support request',
          details: [
            'Mail service usually sufficient for support cases',
            'Complete Proof of Service by Mail',
            'Other parent has time to respond'
          ],
          forms: ['Proof of Service by Mail'],
          timeline: 'Within required timeframe'
        },
        {
          step: 4,
          title: 'Support Hearing',
          description: 'Attend court hearing for support determination',
          details: [
            'Bring all financial documentation',
            'Be prepared to answer questions about income',
            'Judge will calculate support amount',
            'Court issues support order'
          ],
          forms: ['All financial documents'],
          timeline: '1ths total'
        }
      ]
    },
    {
      id: 'restraining-order-process',
      title: 'Restraining Order Process',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      emoji: '🛡️',
      description: 'How to obtain a domestic violence restraining order',
      steps: [
        {
          step: 1,
          title: 'Immediate Safety',
          description: 'If in immediate danger, call 911',
          details: [
            'Call 911, you are in immediate danger, Go to police station if needed',
            'Document any incidents',
            'Keep evidence safe'
          ],
          forms: [],
          timeline: 'Immediate'
        },
        {
          step: 2,
          title: 'File Restraining Order Request',
          description: 'Complete and file the restraining order forms',
          details: [
            'DV-100: Request for Domestic Violence Restraining Order',
            'Include detailed declaration of abuse',
            'Attach any evidence (photos, messages, police reports)',
            'File at courthouse or with Family Court Services'
          ],
          forms: ['DV-100'],
          timeline: 'Same day'
        },
        {
          step: 3,
          title: 'Temporary Order Hearing',
          description: 'Request immediate temporary protection',
          details: [
            'Judge may grant temporary restraining order (TRO)',
            'TRO provides immediate protection',
            'Valid until full hearing (usually 21 days)',
            'Court will set hearing date'
          ],
          forms: ['DV-110: Porary Restraining Order'],
          timeline: 'Same day or next day'
        },
        {
          step: 4,
          title: 'Serve the Respondent',
          description: 'Legally notify the person you need protection from',
          details: [
            'Personal service required',
            'Sheriff or process server can serve',
            'Complete DV-200: Proof of Personal Service',
            'Must be served before hearing'
          ],
          forms: ['DV-200: Proof of Personal Service'],
          timeline: 'Before hearing'
        },
        {
          step: 5,
          title: 'Full Hearing',
          description: 'Attend court hearing for permanent order',
          details: [
            'Bring all evidence and witnesses',
            'Be prepared to testify about abuse',
            'Judge will decide on permanent order',
            'Order can last up to 5 years'
          ],
          forms: ['All evidence and declarations'],
          timeline: '21 days after filing'
        }
      ]
    }
  ];

  const getIconComponent = (iconName) => {
    const icons = {
      Users,
      Baby,
      DollarSign,
      Shield,
      UserCheck,
      Clock,
      Info,
      Calendar,
      FileText,
      HelpCircle,
      MapPin,
      Phone,
      Mail
    };
    return icons[iconName] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-10 mb-10 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center text-blue-700 hover:text-blue-900 transition-all duration-300 text-lg font-semibold bg-white px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </button>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Learn the Process
            </h1>
            <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
              Step-by-step guides for navigating family court procedures in San Mateo County. Understand what to expect at each stage of your case.
            </p>
          </div>
        </div>

        {/* Process Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {courtProcesses.map((process) => {
            const Icon = getIconComponent(process.icon);
            return (
              <button
                key={process.id}
                onClick={() => setSelectedProcess(process)}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-20 transform hover:-translate-y-2 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${process.color} rounded-2xl flex items-center justify-center text-3xl`}>
                    {process.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {process.title}
                    </h3>
                    <p className="text-gray-600">{process.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {process.steps.length} steps
                  </span>
                  <ArrowRight className="w-6 h-6 text-gray-400 hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Process Details */}
        {selectedProcess && (
          <div className="bg-white rounded-3xl shadow-2xl p-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${selectedProcess.color} rounded-2xl flex items-center justify-center text-3xl`}>
                  {selectedProcess.emoji}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedProcess.title}</h2>
                  <p className="text-gray-600">{selectedProcess.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Process Steps */}
            <div className="space-y-8">
              {selectedProcess.steps.map((step) => (
                <div key={step.step} className="border border-gray-200 rounded-2xl shadow-lg transition-shadow hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {step.timeline}
                        </span>
                      </div>
                      <p className="text-gray-700 text-lg mb-6">{step.description}</p>
                      
                      {/* Details */}
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Info className="w-5 h-5 mr-2 text-blue-600" />
                          What to do:
                        </h4>
                        <ul className="space-y-2">
                          {step.details.map((detail, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{detail}</span>                   </li>
                          ))}
                        </ul>
                      </div>

                      {/* Forms */}
                      {step.forms.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Forms needed:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {step.forms.map((form, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {form}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Local Resources */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-16 text-white">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">San Mateo County Resources</h2>
            <p className="text-blue-100 text-xl">Get help with your court process</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-8 h-8" />
                <h3 className="text-xl font-semibold">Court Locations</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Redwood City (Main), South San Francisco, and other branches throughout the county.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <Phone className="w-8 h-8" />
                <h3 className="text-xl font-semibold">Family Law Facilitator</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Free assistance with forms and procedures. Available at Redwood City courthouse.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <HelpCircle className="w-8 h-8" />
                <h3 className="text-xl font-semibold">Self-Help Center</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Guided assistance with court forms and procedures. Online and in-person help available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process; 